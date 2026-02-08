import { useState } from 'react';

export default function FormConfigPanel({ config, onConfigChange }) {
  const [activeTab, setActiveTab] = useState('date');

  const tabs = [
    { id: 'date', label: 'Date Format' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'sections', label: 'Sections' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'date' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month Display Format
              </label>
              <select
                value={config.dateFormat.monthDisplay}
                onChange={(e) => onConfigChange('dateFormat', 'monthDisplay', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="short">Short (Jan)</option>
                <option value="long">Long (January)</option>
                <option value="numeric">Numeric (01)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format Pattern
              </label>
              <select
                value={config.dateFormat.format}
                onChange={(e) => onConfigChange('dateFormat', 'format', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="MMM yyyy">Jan 2026</option>
                <option value="MMMM yyyy">January 2026</option>
                <option value="MM/yyyy">01/2025</option>
                <option value="yyyy">2025</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showHighSchoolDates"
                checked={config.education.showStartDate.highSchool}
                onChange={(e) => onConfigChange('education', 'showStartDate', {
                  ...config.education.showStartDate,
                  highSchool: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="showHighSchoolDates" className="ml-2 text-sm text-gray-700">
                Show dates for high school education
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showHighSchoolField"
                checked={config.education.showFieldOfStudy.highSchool}
                onChange={(e) => onConfigChange('education', 'showFieldOfStudy', {
                  ...config.education.showFieldOfStudy,
                  highSchool: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="showHighSchoolField" className="ml-2 text-sm text-gray-700">
                Show field of study for high school
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Display Format
              </label>
              <select
                value={config.education.gradeFormat}
                onChange={(e) => onConfigChange('education', 'gradeFormat', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="gpa">GPA Only</option>
                <option value="percentage">Percentage Only</option>
                <option value="both">Both GPA and Percentage</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showProficiency"
                checked={config.skills.showProficiency}
                onChange={(e) => onConfigChange('skills', 'showProficiency', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="showProficiency" className="ml-2 text-sm text-gray-700">
                Show proficiency levels
              </label>
            </div>

            {config.skills.showProficiency && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Scale
                </label>
                <select
                  value={config.skills.proficiencyScale}
                  onChange={(e) => onConfigChange('skills', 'proficiencyScale', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="1-5">1-5 Scale</option>
                  <option value="beginner-expert">Beginner to Expert</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills Display Style
              </label>
              <select
                value={config.skills.displayStyle}
                onChange={(e) => onConfigChange('skills', 'displayStyle', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="list">List View</option>
                <option value="grid">Grid View</option>
                <option value="tags">Tag Style</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="groupByCategory"
                checked={config.skills.groupByCategory}
                onChange={(e) => onConfigChange('skills', 'groupByCategory', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="groupByCategory" className="ml-2 text-sm text-gray-700">
                Group skills by category
              </label>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reorderSections"
                checked={config.sections.reorderEnabled}
                onChange={(e) => onConfigChange('sections', 'reorderEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="reorderSections" className="ml-2 text-sm text-gray-700">
                Enable section reordering
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="collapsibleSections"
                checked={config.sections.collapsible}
                onChange={(e) => onConfigChange('sections', 'collapsible', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="collapsibleSections" className="ml-2 text-sm text-gray-700">
                Make sections collapsible
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
