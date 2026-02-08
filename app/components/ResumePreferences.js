import { useState, useEffect } from 'react';
import { defaultConfig } from '../lib/templates';
import { X, Check, ChevronDown, ChevronUp, Settings, RotateCcw, Palette, Calendar, List, Clipboard, GraduationCap, Type, Award } from 'lucide-react';

// Default preferences to ensure all properties exist
const defaultPreferences = {
  dateFormat: {
    monthDisplay: 'short',
    format: 'MMM yyyy'
  },
  education: {
    showGPA: false,
    showPercentage: false,
    showStartDate: {
      highSchool: false
    }
  },
  typography: {
    fontPair: {
      id: 'modern',
      label: 'Modern',
      fontFamily: "'Inter', sans-serif",
      desc: 'Clean and professional'
    }
  },
  skills: {
    showProficiency: false,
    proficiencyScale: '1-5',
    displayStyle: 'tags'
  }
};

export default function ResumePreferences({ config, onChange, onClose }) {
  // Merge provided config with defaults to ensure all properties exist
  const mergeWithDefaults = (userConfig) => {
    return {
      ...defaultPreferences,
      ...userConfig,
      dateFormat: {
        ...defaultPreferences.dateFormat,
        ...(userConfig?.dateFormat || {})
      },
      education: {
        ...defaultPreferences.education,
        ...(userConfig?.education || {}),
        showStartDate: {
          ...defaultPreferences.education.showStartDate,
          ...(userConfig?.education?.showStartDate || {})
        }
      },
      typography: {
        ...defaultPreferences.typography,
        ...(userConfig?.typography || {}),
        fontPair: {
          ...defaultPreferences.typography.fontPair,
          ...(userConfig?.typography?.fontPair || {})
        }
      },
      skills: {
        ...defaultPreferences.skills,
        ...(userConfig?.skills || {})
      }
    };
  };

  const [localPrefs, setLocalPrefs] = useState(() => mergeWithDefaults(config || defaultConfig));
  const [activeTab, setActiveTab] = useState('formatting');
  const [isSaved, setIsSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setLocalPrefs(mergeWithDefaults(config || defaultConfig));
  }, [config]);

  const updatePreference = (section, key, value) => {
    setLocalPrefs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onChange(localPrefs);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    const resetPrefs = mergeWithDefaults(defaultConfig);
    setLocalPrefs(resetPrefs);
  };

  const tabs = [
    { id: 'formatting', label: 'Formatting', icon: <Settings size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" /> },
    { id: 'content', label: 'Content', icon: <Clipboard size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" /> },
    { id: 'design', label: 'Design', icon: <Palette size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 lg:p-6">
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl lg:max-w-4xl h-[95vh] sm:h-[90vh] lg:h-[85vh] overflow-hidden flex flex-col relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 flex items-center justify-between border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="min-w-0 flex-1">
            <h2 id="modal-title" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="text-indigo-600 flex-shrink-0" size={18} />
              <span className="truncate">Resume Preferences</span>
            </h2>
            <p id="modal-description" className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Customize your resume appearance and content
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1.5 sm:p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ml-2 flex-shrink-0"
            aria-label="Close preferences modal"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tab Navigation - Desktop */}
        <div className="hidden md:flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 lg:px-6 py-3 text-sm lg:text-base font-medium relative transition-colors ${activeTab === tab.id
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden px-3 sm:px-4 pt-2 sm:pt-3">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              aria-label="Select preference category"
            >
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {activeTab === 'formatting' && (
            <div className="space-y-4 sm:space-y-6">
              <section className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Date Formatting
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Month Display
                    </label>
                    <div className="relative">
                      <select
                        value={localPrefs.dateFormat?.monthDisplay || 'short'}
                        onChange={e => updatePreference('dateFormat', 'monthDisplay', e.target.value)}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        aria-describedby="month-display-help"
                      >
                        <option value="short">Short (Jan)</option>
                        <option value="long">Long (January)</option>
                        <option value="numeric">Numeric (01)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <p id="month-display-help" className="mt-1 text-xs text-gray-500">
                      Choose how months are displayed
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Date Format
                    </label>
                    <div className="relative">
                      <select
                        value={localPrefs.dateFormat?.format || 'MMM yyyy'}
                        onChange={e => updatePreference('dateFormat', 'format', e.target.value)}
                        className="appearance-none block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        aria-describedby="date-format-help"
                      >
                        <option value="MMM yyyy">Jan 2026</option>
                        <option value="MMMM yyyy">January 2026</option>
                        <option value="MM/yyyy">01/2025</option>
                        <option value="MM-yyyy">01-2025</option>
                        <option value="dd/MM/yyyy">26/05/2025</option>
                        <option value="yyyy-MM-dd">2025-05-26</option>
                        <option value="yyyy/MM/dd">2025/05/26</option>
                        <option value="yyyy/MM">2025/05</option>
                        <option value="yyyy">2025</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <p id="date-format-help" className="mt-1 text-xs text-gray-500">
                      Preview: {new Date().toLocaleDateString('en-US', {
                        month: localPrefs.dateFormat?.monthDisplay === 'short' ? 'short' :
                          localPrefs.dateFormat?.monthDisplay === 'long' ? 'long' : '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <List size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Content Display
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="show-gpa"
                        type="checkbox"
                        checked={localPrefs.education?.showGPA || false}
                        onChange={e => updatePreference('education', 'showGPA', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-describedby="show-gpa-help"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="show-gpa" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Show GPA
                      </label>
                      <p id="show-gpa-help" className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Display your grade point average
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="show-percentage"
                        type="checkbox"
                        checked={localPrefs.education?.showPercentage || false}
                        onChange={e => updatePreference('education', 'showPercentage', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-describedby="show-percentage-help"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="show-percentage" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Show Percentage
                      </label>
                      <p id="show-percentage-help" className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Display percentage scores if available
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4 sm:space-y-6">
              <section className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <GraduationCap size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Education Details
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="high-school-dates"
                        type="checkbox"
                        checked={localPrefs.education?.showStartDate?.highSchool || false}
                        onChange={e => updatePreference('education', 'showStartDate', {
                          ...localPrefs.education?.showStartDate,
                          highSchool: e.target.checked
                        })}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-describedby="high-school-dates-help"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="high-school-dates" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Show High School Dates
                      </label>
                      <p id="high-school-dates-help" className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Include start/end dates for secondary education
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-4 sm:space-y-6">
              <section className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Type size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Typography
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { id: "modern", label: "Modern", fontFamily: "'Inter', sans-serif", desc: "Clean and professional" },
                    { id: "elegant", label: "Elegant", fontFamily: "'Playfair Display', serif", desc: "Classic and refined" },
                    { id: "classic", label: "Classic", fontFamily: "'Times New Roman', serif", desc: "Traditional and formal" },
                    { id: "tech", label: "Tech", fontFamily: "'Roboto Mono', monospace", desc: "Technical and modern" },
                  ].map((fp) => (
                    <button
                      key={fp.id}
                      onClick={() => updatePreference('typography', 'fontPair', fp)}
                      style={{ fontFamily: fp.fontFamily }}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 text-sm transition-all flex flex-col items-start min-h-[80px] sm:min-h-[90px] ${localPrefs.typography?.fontPair?.id === fp.id
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                          : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      aria-pressed={localPrefs.typography?.fontPair?.id === fp.id}
                      aria-describedby={`font-${fp.id}-desc`}
                    >
                      <span className="font-semibold">{fp.label}</span>
                      <span id={`font-${fp.id}-desc`} className="text-xs text-gray-500 mt-1">{fp.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-gray-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Award size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
                  Skills Display
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        id="show-proficiency"
                        type="checkbox"
                        checked={localPrefs.skills?.showProficiency || false}
                        onChange={e => updatePreference('skills', 'showProficiency', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-describedby="show-proficiency-help"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="show-proficiency" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Show Proficiency Levels
                      </label>
                      <p id="show-proficiency-help" className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Visual indicators of your skill levels
                      </p>
                    </div>
                  </div>

                  {localPrefs.skills?.showProficiency && (
                    <div className="space-y-3 pl-6 sm:pl-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Proficiency Scale
                        </label>
                        <div className="relative">
                          <select
                            value={localPrefs.skills?.proficiencyScale || '1-5'}
                            onChange={e => updatePreference('skills', 'proficiencyScale', e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            aria-describedby="proficiency-scale-help"
                          >
                            <option value="1-5">1-5 Scale</option>
                            <option value="beginner-expert">Beginner to Expert</option>
                            <option value="percentage">Percentage</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown size={16} className="text-gray-400" />
                          </div>
                        </div>
                        <p id="proficiency-scale-help" className="mt-1 text-xs text-gray-500">
                          Choose how skill proficiency is displayed
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Display Style
                    </label>
                    <div className="relative">
                      <select
                        value={localPrefs.skills?.displayStyle || 'tags'}
                        onChange={e => updatePreference('skills', 'displayStyle', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        aria-describedby="display-style-help"
                      >
                        <option value="list">List</option>
                        <option value="grid">Grid</option>
                        <option value="tags">Tags</option>
                        <option value="bars">Bars</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <p id="display-style-help" className="mt-1 text-xs text-gray-500">
                      Choose how skills are visually arranged
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white z-10 border-t px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
            aria-label="Reset all preferences to default values"
          >
            <RotateCcw size={16} className="sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base">Reset Defaults</span>
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaved
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              disabled={isSaved}
              aria-label={isSaved ? "Preferences saved successfully" : "Save all preference changes"}
            >
              {isSaved ? (
                <>
                  <Check size={16} className="sm:w-4 sm:h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}