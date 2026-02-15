"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Undo, 
  Redo, 
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Sparkles,
  ListPlus,
  ListMinus,
  Type
} from 'lucide-react';
import useUndoRedo from '../hooks/useUndoRedo';
import { saveFieldVersion } from '../lib/versionHistory';
import InlineVersionSelector from './InlineVersionSelector';
import toast from 'react-hot-toast';

const AdvancedTextEditor = ({ 
  value = "", 
  onChange, 
  onClose,
  placeholder = "Start typing...",
  title = "Text Editor",
  fieldName = "text",
  isOpen = false,
  disableAIBullets = false,
  userId = null,
  resumeId = null,
  fieldPath = null,
  onVersionSave = null,
  isPremium = false,
  isBasicPlan = false,
  isOneDayPlan = false,
  aiRephraseUses = 0,
  aiBulletsUses = 0,
  onAIRephraseUse = null,
  onAIBulletsUse = null
}) => {
  const textareaRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [localValue, setLocalValue] = useState(value);
  
  const { currentState, updateState, undo, redo, canUndo, canRedo } = useUndoRedo(localValue);

  // Sync with external value changes (like AI bullets)
  useEffect(() => {
    if (isOpen && value !== localValue) {
      setLocalValue(value);
      updateState(value);
    }
  }, [isOpen, value, localValue, updateState]);

  // Update word and character counts
  useEffect(() => {
    const words = currentState.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = currentState.length;
    setWordCount(words);
    setCharCount(chars);
  }, [currentState]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(true);
    }
  }, [isOpen]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    updateState(newValue);
  }, [updateState]);

  const handleUndo = useCallback((e) => {
    e.preventDefault();
    if (canUndo) {
      undo();
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback((e) => {
    e.preventDefault();
    if (canRedo) {
      redo();
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [canRedo, redo]);

  const [isRephrasing, setIsRephrasing] = useState(false);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);

  const handleAIRephrase = useCallback(async () => {
    if (!currentState.trim()) return;
    
    // Check usage limits based on plan
    let limit = 2; // Free users
    let planName = "Free";
    
    if (isPremium) {
      limit = Infinity;
      planName = "Premium";
    } else if (isBasicPlan) {
      limit = 3;
      planName = "Basic";
    } else if (isOneDayPlan) {
      limit = 3;
      planName = "One-Day";
    }
    
    // Check if limit reached (skip for premium)
    if (!isPremium && aiRephraseUses >= limit) {
      toast.error(
        `${planName} plan users have a limit of ${limit} AI Rephrase uses. Upgrade to Premium for unlimited access!`,
        {
          duration: 6000,
          action: {
            label: 'Upgrade Now',
            onClick: () => window.location.href = '/pricing'
          }
        }
      );
      return;
    }
    
    setIsRephrasing(true);
    try {
      const response = await fetch("/api/rephrase-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentState }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("AI Rephrase response:", data);
      
      if (data.rephrased) {
        updateState(data.rephrased);
        setTimeout(() => textareaRef.current?.focus(), 0);
        
        // Increment usage count
        if (onAIRephraseUse) {
          onAIRephraseUse();
        }
        
        // Save version history
        if (userId && fieldPath) {
          saveFieldVersion(userId, resumeId, fieldPath, data.rephrased, 'ai_rephrase');
        }
        
        toast.success("Text rephrased successfully!");
        
        // Show remaining uses for non-premium users
        if (!isPremium) {
          const remaining = limit - (aiRephraseUses + 1);
          if (remaining > 0) {
            toast(`${remaining} AI Rephrase use${remaining !== 1 ? 's' : ''} remaining`, {
              icon: '💡',
              duration: 3000
            });
          }
        }
      } else if (data.error) {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("AI Rephrase failed:", error);
      toast.error("Failed to rephrase text. Please try again.");
    } finally {
      setIsRephrasing(false);
    }
  }, [currentState, updateState, isPremium, isBasicPlan, isOneDayPlan, aiRephraseUses, onAIRephraseUse, userId, resumeId, fieldPath]);

  const handleAddBullets = useCallback(() => {
    const lines = currentState.split('\n').filter(line => line.trim());
    const withBullets = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed.match(/^[•\-\*\d\.]/)) {
        return `• ${trimmed}`;
      }
      return trimmed;
    }).join('\n');
    updateState(withBullets);
  }, [currentState, updateState]);

  const handleRemoveBullets = useCallback(() => {
    const lines = currentState.split('\n');
    const withoutBullets = lines.map(line => 
      line.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "").trim()
    ).filter(Boolean).join('\n');
    updateState(withoutBullets);
  }, [currentState, updateState]);

  const handleAIBullets = useCallback(async () => {
    if (!currentState.trim()) return;
    
    // Check usage limits based on plan
    let limit = 2; // Free users
    let planName = "Free";
    
    if (isPremium) {
      limit = Infinity;
      planName = "Premium";
    } else if (isBasicPlan) {
      limit = 3;
      planName = "Basic";
    } else if (isOneDayPlan) {
      limit = 3;
      planName = "One-Day";
    }
    
    // Check if limit reached (skip for premium)
    if (!isPremium && aiBulletsUses >= limit) {
      toast.error(
        `${planName} plan users have a limit of ${limit} AI Bullets uses. Upgrade to Premium for unlimited access!`,
        {
          duration: 6000,
          action: {
            label: 'Upgrade Now',
            onClick: () => window.location.href = '/pricing'
          }
        }
      );
      return;
    }
    
    setIsGeneratingBullets(true);
    try {
      const response = await fetch("/api/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentState }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("AI Bullets response:", data);
      
      if (data.bullets && Array.isArray(data.bullets)) {
        const bulletText = data.bullets.map(b => `• ${b}`).join('\n');
        updateState(bulletText);
        setTimeout(() => textareaRef.current?.focus(), 0);
        
        // Increment usage count
        if (onAIBulletsUse) {
          onAIBulletsUse();
        }
        
        // Save version history
        if (userId && fieldPath) {
          saveFieldVersion(userId, resumeId, fieldPath, bulletText, 'ai_bullets');
        }
        
        toast.success("Bullets generated successfully!");
        
        // Show remaining uses for non-premium users
        if (!isPremium) {
          const remaining = limit - (aiBulletsUses + 1);
          if (remaining > 0) {
            toast(`${remaining} AI Bullets use${remaining !== 1 ? 's' : ''} remaining`, {
              icon: '💡',
              duration: 3000
            });
          }
        }
      } else if (data.error) {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("AI Bullets failed:", error);
      toast.error("Failed to generate bullets. Please try again.");
    } finally {
      setIsGeneratingBullets(false);
    }
  }, [currentState, updateState, isPremium, isBasicPlan, isOneDayPlan, aiBulletsUses, onAIBulletsUse, userId, resumeId, fieldPath]);

  const handleKeyDown = useCallback((e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo(e);
          } else {
            handleUndo(e);
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo(e);
          break;
        default:
          break;
      }
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = currentState.substring(0, start) + '  ' + currentState.substring(end);
      updateState(newValue);
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  }, [handleUndo, handleRedo, currentState, updateState, onChange]);

  const handleSave = useCallback(() => {
    onChange(currentState);
    onClose();
  }, [currentState, onChange, onClose]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentState);
  }, [currentState]);

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear all text?')) {
      updateState('');
    }
  }, [updateState]);

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false, disabled = false, shortcut }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
      className={`
        flex-1 sm:flex-none p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex items-center justify-center
        ${isActive 
          ? 'bg-accent-50 text-accent-700 border border-accent/30 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:shadow-sm active:scale-95'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50
        min-h-[44px] sm:min-w-[44px] sm:min-h-[44px]
        touch-manipulation
      `}
    >
      <Icon size={18} />
    </button>
  );

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`
        bg-white shadow-2xl border border-gray-200 flex flex-col w-full h-full rounded-none
        transition-all duration-300 ease-in-out
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Type size={18} className="text-accent flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h2>
              <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">{fieldName} Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {userId && fieldPath && (
              <InlineVersionSelector
                userId={userId}
                resumeId={resumeId}
                fieldPath={fieldPath}
                currentValue={currentState}
                onSelectVersion={(restoredValue) => {
                  updateState(restoredValue);
                  onChange(restoredValue);
                  if (userId && fieldPath) {
                    saveFieldVersion(userId, resumeId, fieldPath, restoredValue, 'manual_restore');
                  }
                }}
              />
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              title="Close Editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-white">
          {/* Desktop Toolbar - Single Row */}
          <div className="hidden sm:flex items-center justify-between p-4 gap-2">
            <div className="flex items-center gap-2">
              <ToolbarButton
                onClick={handleUndo}
                icon={Undo}
                title="Undo"
                disabled={!canUndo}
                shortcut="Ctrl+Z"
              />
              <ToolbarButton
                onClick={handleRedo}
                icon={Redo}
                title="Redo"
                disabled={!canRedo}
                shortcut="Ctrl+Y"
              />
              
              <div className="w-px h-8 bg-gray-300 mx-2" />
              
              <button
                onClick={handleAIRephrase}
                disabled={isRephrasing || isGeneratingBullets || !currentState.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-primary text-white rounded-lg hover:from-purple-600 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm whitespace-nowrap"
                title="Rephrase with AI"
              >
                <Sparkles size={16} />
                <span className="font-medium">
                  {isRephrasing ? "Rephrasing..." : "AI Rephrase"}
                </span>
              </button>
              
              {!disableAIBullets && (
                <>
                  <button
                    onClick={handleAIBullets}
                    disabled={isRephrasing || isGeneratingBullets || !currentState.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm whitespace-nowrap"
                    title="Generate AI Bullets"
                  >
                    <Sparkles size={16} />
                    <span className="font-medium">
                      {isGeneratingBullets ? "Generating..." : "AI Bullets"}
                    </span>
                  </button>
                  
                  <div className="w-px h-8 bg-gray-300 mx-2" />
                  
                  <ToolbarButton
                    onClick={handleAddBullets}
                    icon={ListPlus}
                    title="Add Bullets"
                    disabled={isRephrasing || isGeneratingBullets}
                  />
                  <ToolbarButton
                    onClick={handleRemoveBullets}
                    icon={ListMinus}
                    title="Remove Bullets"
                    disabled={isRephrasing || isGeneratingBullets}
                  />
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ToolbarButton
                onClick={handleCopy}
                icon={Copy}
                title="Copy All"
              />
              <ToolbarButton
                onClick={handleClear}
                icon={Trash2}
                title="Clear All"
              />
            </div>
          </div>

          {/* Mobile Toolbar - Two Rows */}
          <div className="flex sm:hidden flex-col gap-2 p-2">
            {/* Row 1: Primary AI Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAIRephrase}
                disabled={isRephrasing || isGeneratingBullets || !currentState.trim()}
                className={`${disableAIBullets ? 'w-full' : 'flex-1'} flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-primary text-white rounded-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm touch-manipulation font-medium text-sm`}
                title="Rephrase with AI"
              >
                <Sparkles size={16} />
                <span>{isRephrasing ? "Rephrasing..." : "AI Rephrase"}</span>
              </button>
              
              {!disableAIBullets && (
                <button
                  onClick={handleAIBullets}
                  disabled={isRephrasing || isGeneratingBullets || !currentState.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm touch-manipulation font-medium text-sm"
                  title="Generate AI Bullets"
                >
                  <Sparkles size={16} />
                  <span>{isGeneratingBullets ? "Generating..." : "AI Bullets"}</span>
                </button>
              )}
            </div>

            {/* Row 2: Utility Actions */}
            <div className="flex items-center gap-2">
              <ToolbarButton
                onClick={handleUndo}
                icon={Undo}
                title="Undo"
                disabled={!canUndo}
              />
              <ToolbarButton
                onClick={handleRedo}
                icon={Redo}
                title="Redo"
                disabled={!canRedo}
              />
              {!disableAIBullets && (
                <>
                  <ToolbarButton
                    onClick={handleAddBullets}
                    icon={ListPlus}
                    title="Add Bullets"
                    disabled={isRephrasing || isGeneratingBullets}
                  />
                  <ToolbarButton
                    onClick={handleRemoveBullets}
                    icon={ListMinus}
                    title="Remove Bullets"
                    disabled={isRephrasing || isGeneratingBullets}
                  />
                </>
              )}
              <ToolbarButton
                onClick={handleCopy}
                icon={Copy}
                title="Copy All"
              />
              <ToolbarButton
                onClick={handleClear}
                icon={Trash2}
                title="Clear All"
              />
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={currentState}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full flex-1 resize-none border-0 focus:outline-none
              text-sm sm:text-base leading-relaxed
              ${isFullscreen ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}
            `}
            style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
              lineHeight: '1.6',
              fontSize: isFullscreen ? '18px' : '15px'
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-t border-gray-200 bg-gray-50 gap-3">
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 flex-wrap">
            <span className="whitespace-nowrap">{wordCount} words</span>
            <span className="whitespace-nowrap">{charCount} chars</span>
            <span className="whitespace-nowrap hidden sm:inline">{charCount > 0 ? Math.ceil(charCount / 5) : 0}s read</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium text-sm touch-manipulation"
            >
              Save & Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
};

export default AdvancedTextEditor;
