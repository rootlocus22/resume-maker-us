"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import useUndoRedo from '../hooks/useUndoRedo';
import AdvancedTextEditor from './AdvancedTextEditor';
import InlineVersionSelector from './InlineVersionSelector';
import { saveFieldVersion } from '../lib/versionHistory';

const UndoableTextarea = ({ 
  value = "", 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  height = "h-24",
  disabled = false,
  showToolbar = true,
  fieldName = "text",
  title = "Text Editor",
  disableAIBullets = false,
  userId = null,
  resumeId = null,
  fieldPath = null,
  isPremium = false,
  isBasicPlan = false,
  isOneDayPlan = false,
  aiRephraseUses = 0,
  aiBulletsUses = 0,
  onAIRephraseUse = null,
  onAIBulletsUse = null
}) => {
  const textareaRef = useRef(null);
  const [isAdvancedEditorOpen, setIsAdvancedEditorOpen] = useState(false);
  const { currentState, updateState } = useUndoRedo(value);
  const lastSavedValue = useRef(value);

  // Update the undo/redo history when value prop changes
  useEffect(() => {
    if (value !== currentState) {
      updateState(value);
    }
  }, [value, currentState, updateState]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    updateState(newValue);
    onChange(newValue);
  }, [updateState, onChange]);

  // Save version history after significant changes (debounced)
  useEffect(() => {
    if (!userId || !fieldPath) return;
    
    // Only save if the value has actually changed significantly
    if (currentState && currentState !== lastSavedValue.current && currentState.length > 5) {
      const timeoutId = setTimeout(() => {
        saveFieldVersion(userId, resumeId, fieldPath, currentState, 'manual_edit');
        lastSavedValue.current = currentState;
      }, 3000); // Save after 3 seconds of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [currentState, userId, resumeId, fieldPath]);

  const handleKeyDown = useCallback((e) => {
    // Handle Enter key for line breaks
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + '\n' + currentValue.substring(end);
      
      updateState(newValue);
      onChange(newValue);
      
      // Set cursor position after the newline
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + '  ' + currentValue.substring(end);
      
      updateState(newValue);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  }, [updateState, onChange]);

  const handlePaste = useCallback((e) => {
    // Handle paste events properly
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue = currentValue.substring(0, start) + paste + currentValue.substring(end);
    
    updateState(newValue);
    onChange(newValue);
    
    // Set cursor position after the pasted text
    setTimeout(() => {
      textarea.setSelectionRange(start + paste.length, start + paste.length);
    }, 0);
  }, [updateState, onChange]);

  const ToolbarButton = ({ onClick, icon: Icon, title, isDisabled = false, isHighlight = false, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`
        p-1.5 rounded-md transition-colors duration-200
        ${isActive 
          ? 'bg-accent-50 text-accent-700 border border-accent/30' 
          : isHighlight 
            ? 'bg-accent-50 text-accent-700 hover:bg-accent-100' 
            : isDisabled 
              ? 'opacity-50 cursor-not-allowed text-gray-400' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50
      `}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <div className={`relative border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-accent focus-within:border-accent ${className}`}>
      {showToolbar && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-md gap-2">
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => setIsAdvancedEditorOpen(true)}
              icon={Maximize2}
              title="Open Advanced Editor"
              isHighlight={true}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{currentState.length} chars</span>
            {userId && fieldPath && (
              <InlineVersionSelector
                userId={userId}
                resumeId={resumeId}
                fieldPath={fieldPath}
                currentValue={currentState}
                onSelectVersion={(restoredValue) => {
                  updateState(restoredValue);
                  onChange(restoredValue);
                  // Save the restore action
                  saveFieldVersion(userId, resumeId, fieldPath, restoredValue, 'manual_restore');
                }}
              />
            )}
          </div>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={currentState}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border-0 focus:outline-none resize-none
          ${height} ${showToolbar ? 'rounded-b-md' : 'rounded-md'}
          ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          transition-all duration-200
        `}
        style={{ 
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
      
      <AdvancedTextEditor
        value={currentState}
        onChange={(newValue) => {
          updateState(newValue);
          onChange(newValue);
        }}
        onClose={() => setIsAdvancedEditorOpen(false)}
        isOpen={isAdvancedEditorOpen}
        title={title}
        fieldName={fieldName}
        placeholder={placeholder}
        disableAIBullets={disableAIBullets}
        userId={userId}
        resumeId={resumeId}
        fieldPath={fieldPath}
        isPremium={isPremium}
        isBasicPlan={isBasicPlan}
        isOneDayPlan={isOneDayPlan}
        aiRephraseUses={aiRephraseUses}
        aiBulletsUses={aiBulletsUses}
        onAIRephraseUse={onAIRephraseUse}
        onAIBulletsUse={onAIBulletsUse}
      />
    </div>
  );
};

export default UndoableTextarea;
