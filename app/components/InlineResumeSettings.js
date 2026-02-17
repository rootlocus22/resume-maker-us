"use client";
import { useState, useCallback } from 'react';
import {
  Type, Eye, EyeOff, Calendar, Palette, ChevronDown, ChevronUp,
  Sliders, Minus, Plus
} from 'lucide-react';

// ─── Font options ───
const FONTS = [
  { id: 'modern', label: 'Modern', fontFamily: "'Inter', sans-serif" },
  { id: 'elegant', label: 'Elegant', fontFamily: "'Playfair Display', serif" },
  { id: 'classic', label: 'Classic', fontFamily: "'Times New Roman', serif" },
  { id: 'tech', label: 'Tech', fontFamily: "'Roboto Mono', monospace" },
  { id: 'minimal', label: 'Minimal', fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  { id: 'humanist', label: 'Humanist', fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif" },
];

const DATE_FORMATS = [
  { value: 'MMM yyyy', label: 'Jan 2026' },
  { value: 'MMMM yyyy', label: 'January 2026' },
  { value: 'MM/yyyy', label: '01/2026' },
  { value: 'yyyy', label: '2026' },
];

const FONT_SIZES = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
];

const SECTIONS = [
  { key: 'summary', label: 'Summary' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'languages', label: 'Languages' },
  { key: 'customSections', label: 'Custom' },
  { key: 'photo', label: 'Photo' },
];

export default function InlineResumeSettings({ preferences, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'font' | 'date' | 'visibility' | 'size'

  // Instant preference update (no save button)
  const update = useCallback((section, key, value) => {
    const next = {
      ...preferences,
      [section]: { ...preferences?.[section], [key]: value }
    };
    onChange(next);
  }, [preferences, onChange]);

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
    if (!expanded) setExpanded(true);
  };

  const currentFont = preferences?.typography?.fontPair?.id || 'modern';
  const currentFontSize = preferences?.typography?.fontSize || 'medium';
  const currentDateFormat = preferences?.dateFormat?.format || 'MMM yyyy';
  const visibility = preferences?.visibility || {};
  const hiddenCount = SECTIONS.filter(s => visibility[s.key] === false).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* ─── Compact Toolbar ─── */}
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto no-scrollbar">
        {/* Toggle expand */}
        <button
          onClick={() => { setExpanded(!expanded); if (expanded) setActivePanel(null); }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          title="Resume settings"
        >
          <Sliders size={13} />
          <span className="hidden sm:inline">Settings</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Font button */}
        <button
          onClick={() => togglePanel('font')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
            activePanel === 'font' ? 'bg-primary-50 text-primary ring-1 ring-primary-200' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Type size={13} />
          <span style={{ fontFamily: FONTS.find(f => f.id === currentFont)?.fontFamily }}>
            {FONTS.find(f => f.id === currentFont)?.label || 'Modern'}
          </span>
        </button>

        {/* Font Size button */}
        <button
          onClick={() => togglePanel('size')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
            activePanel === 'size' ? 'bg-primary-50 text-primary ring-1 ring-primary-200' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-[10px]">A</span>
          <span className="font-bold text-sm -ml-0.5">A</span>
        </button>

        {/* Date format button */}
        <button
          onClick={() => togglePanel('date')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
            activePanel === 'date' ? 'bg-primary-50 text-primary ring-1 ring-primary-200' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar size={13} />
          <span className="hidden sm:inline">{DATE_FORMATS.find(d => d.value === currentDateFormat)?.label || 'Jan 2026'}</span>
        </button>

        {/* Visibility button */}
        <button
          onClick={() => togglePanel('visibility')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
            activePanel === 'visibility' ? 'bg-primary-50 text-primary ring-1 ring-primary-200' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Eye size={13} />
          <span className="hidden sm:inline">Sections</span>
          {hiddenCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{hiddenCount} off</span>
          )}
        </button>
      </div>

      {/* ─── Expandable Panels ─── */}
      {expanded && activePanel && (
        <div className="border-t border-gray-100 px-3 py-3 bg-gray-50/50">

          {/* Font Panel */}
          {activePanel === 'font' && (
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Font Family</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {FONTS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => update('typography', 'fontPair', f)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                      currentFont === f.id
                        ? 'bg-primary-100 text-primary ring-1 ring-primary-200 shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: f.fontFamily }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Font Size Panel */}
          {activePanel === 'size' && (
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Text Size</p>
              <div className="flex items-center gap-2">
                <Minus size={14} className="text-gray-400" />
                <div className="flex gap-1 flex-1">
                  {FONT_SIZES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => update('typography', 'fontSize', s.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium text-center transition-all ${
                        currentFontSize === s.value
                          ? 'bg-primary-100 text-primary ring-1 ring-primary-200'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s.value === 'small' ? '9pt' : s.value === 'large' ? '11.5pt' : '10pt'}
                    </button>
                  ))}
                </div>
                <Plus size={14} className="text-gray-400" />
              </div>
              <div className="mt-2">
                <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Line Height</p>
                <div className="flex gap-1">
                  {['compact', 'normal', 'relaxed'].map(lh => (
                    <button
                      key={lh}
                      onClick={() => update('typography', 'lineHeight', lh)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-center transition-all capitalize ${
                        (preferences?.typography?.lineHeight || 'normal') === lh
                          ? 'bg-primary-100 text-primary ring-1 ring-primary-200'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date Format Panel */}
          {activePanel === 'date' && (
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Date Format</p>
              <div className="flex gap-1.5 flex-wrap">
                {DATE_FORMATS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => {
                      const next = {
                        ...preferences,
                        dateFormat: {
                          ...preferences?.dateFormat,
                          format: d.value,
                          monthDisplay: d.value.startsWith('MMM') ? (d.value.startsWith('MMMM') ? 'long' : 'short') : 'numeric'
                        }
                      };
                      onChange(next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentDateFormat === d.value
                        ? 'bg-primary-100 text-primary ring-1 ring-primary-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visibility Panel */}
          {activePanel === 'visibility' && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Show / Hide Sections</p>
                <div className="flex flex-wrap gap-1.5">
                  {SECTIONS.map(s => {
                    const isVisible = visibility[s.key] !== false;
                    return (
                      <button
                        key={s.key}
                        onClick={() => update('visibility', s.key, !isVisible)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isVisible
                            ? 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                            : 'bg-orange-50 text-orange-600 border border-orange-200 line-through'
                        }`}
                      >
                        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Education details visibility */}
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-2 uppercase tracking-wider">Education Details</p>
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const showGPA = preferences?.education?.showGPA !== false;
                    return (
                      <button
                        onClick={() => update('education', 'showGPA', !showGPA)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          showGPA
                            ? 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                            : 'bg-orange-50 text-orange-600 border border-orange-200 line-through'
                        }`}
                      >
                        {showGPA ? <Eye size={12} /> : <EyeOff size={12} />}
                        GPA / CGPA
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
