"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Edit3, Undo, Redo, Maximize2 } from 'lucide-react';
import { parseRichText, RichTextRenderer, useRichTextMode } from '../lib/richTextRenderer';
import AdvancedTextEditor from './AdvancedTextEditor';

const RichTextarea = ({ 
  value = "", 
  onChange, 
  placeholder = "Start typing...", 
  className = "",
  height = "h-24",
  disabled = false,
  showToolbar = true,
  fieldName = "text",
  title = "Text Editor"
}) => {
  const textareaRef = useRef(null);
  const [isAdvancedEditorOpen, setIsAdvancedEditorOpen] = useState(false);
  const { mode, toggleMode } = useRichTextMode('edit');

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);
  }, [onChange]);


  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'e':
          e.preventDefault();
          toggleMode();
          break;
        default:
          break;
      }
    }

    // Handle Enter key for line breaks
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      onChange(newValue);
      
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
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  }, [value, onChange, toggleMode]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + paste + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.setSelectionRange(start + paste.length, start + paste.length);
    }, 0);
  }, [value, onChange]);

  const ToolbarButton = ({ onClick, icon: Icon, title, isDisabled = false, isActive = false, isHighlight = false }) => (
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
    <div className={`border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-accent focus-within:border-accent ${className}`}>
      {showToolbar && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={toggleMode}
              icon={mode === 'edit' ? Eye : Edit3}
              title={mode === 'edit' ? "Preview (Ctrl+E)" : "Edit (Ctrl+E)"}
              isActive={mode === 'preview'}
            />
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => setIsAdvancedEditorOpen(true)}
              icon={Maximize2}
              title="Open Advanced Editor"
              isHighlight={true}
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{value.length} characters</span>
          </div>
        </div>
      )}
      
      <div className="relative">
        {mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={value}
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
        ) : (
          <div 
            className={`
              w-full px-3 py-2 min-h-24 max-h-96 overflow-y-auto
              ${showToolbar ? 'rounded-b-md' : 'rounded-md'}
              bg-white border-0
            `}
            style={{ 
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5',
              minHeight: height === 'h-24' ? '96px' : height === 'h-32' ? '128px' : '96px'
            }}
          >
            <RichTextRenderer 
              text={value || placeholder} 
              className="text-gray-900"
            />
          </div>
        )}
      </div>
      
      <AdvancedTextEditor
        value={value}
        onChange={onChange}
        onClose={() => setIsAdvancedEditorOpen(false)}
        isOpen={isAdvancedEditorOpen}
        title={title}
        fieldName={fieldName}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextarea;
