"use client";

import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, AlertCircle, Sparkles, Loader2, Wand2, ChevronDown, ChevronUp, CheckCircle, Edit3, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedTextEditor from './AdvancedTextEditor';

// NO character limits in UI - completely free form
// AI backend will intelligently optimize content during PDF generation
// Users can write as much as they want without any restrictions

export default function OnePagerResumeFormAI({ data, onChange, userId = null, resumeId = null, userPlan = 'free' }) {
  const [collapsedSections, setCollapsedSections] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});

  // Advanced Text Editor state
  const [editorOpen, setEditorOpen] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [editorConfig, setEditorConfig] = useState({});

  // AI usage tracking
  const [aiRephraseUses, setAiRephraseUses] = useState(0);
  const [aiBulletsUses, setAiBulletsUses] = useState(0);

  // Toggle section collapse/expand
  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Calculate completion percentage for each section
  const getSectionCompletion = (sectionId) => {
    switch (sectionId) {
      case 'personal':
        const personalFields = [data.personal?.name, data.personal?.email, data.personal?.phone, data.personal?.jobTitle];
        const filledPersonal = personalFields.filter(f => f && f.trim()).length;
        return Math.round((filledPersonal / personalFields.length) * 100);

      case 'summary':
        return (data.summary && data.summary.length > 50) ? 100 : 0;

      case 'experience':
        if (!data.experience || data.experience.length === 0) return 0;
        const expComplete = data.experience.filter(exp =>
          exp.title && exp.company && exp.description
        ).length;
        return Math.round((expComplete / data.experience.length) * 100);

      case 'education':
        if (!data.education || data.education.length === 0) return 0;
        const eduComplete = data.education.filter(edu =>
          edu.degree && edu.school
        ).length;
        return Math.round((eduComplete / data.education.length) * 100);

      case 'skills':
        return (data.skills && data.skills.length >= 5) ? 100 : Math.round((data.skills?.length || 0) * 20);

      case 'projects':
        if (!data.projects || data.projects.length === 0) return 0;
        const projComplete = data.projects.filter(proj =>
          proj.name && proj.description
        ).length;
        return Math.round((projComplete / data.projects.length) * 100);

      case 'certifications':
        return (data.certifications && data.certifications.length > 0) ? 100 : 0;

      case 'languages':
        return (data.languages && data.languages.length > 0) ? 100 : 0;

      case 'awards':
        return (data.awards && data.awards.length > 0) ? 100 : 0;

      default:
        return 0;
    }
  };

  // No character counter needed - completely free form!

  // AI Enhancement Functions
  const enhanceWithAI = async (field, currentText, context = {}) => {
    const loadingKey = `${field}-${Date.now()}`;
    setAiLoading(prev => ({ ...prev, [field]: true }));

    // Show loading toast
    const loadingToast = toast.loading('✨ AI is enhancing your content...');

    try {
      const response = await fetch('/api/enhance-one-pager-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          currentText,
          context
          // No char limits - AI will optimize naturally
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const result = await response.json();
      setAiSuggestions(prev => ({ ...prev, [field]: result.suggestions }));

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('🎉 AI suggestions ready! Click to apply.', {
        duration: 3000,
        icon: '✨'
      });
    } catch (error) {
      console.error('AI enhancement error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to get AI suggestions. Please try again.');
    } finally {
      setAiLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const applySuggestion = (field, suggestion, applyFunc) => {
    // Apply the suggestion - this will call onChange internally via handlePersonalChange, handleSummaryChange, etc.
    applyFunc(suggestion);

    // Clear the AI suggestion from the UI
    setAiSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[field];
      return newSuggestions;
    });

    // Show success message
    toast.success('✅ AI suggestion applied!', {
      duration: 2000
    });

    // Note: No need to call onChange here - applyFunc already does it
    // Removed the setTimeout that was calling onChange with old data
  };

  const AIButton = ({ field, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled || aiLoading[field]}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {aiLoading[field] ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span className="hidden sm:inline">AI Working...</span>
          <span className="sm:hidden">AI...</span>
        </>
      ) : (
        <>
          <Sparkles size={12} />
          <span className="hidden sm:inline">Enhance with AI</span>
          <span className="sm:hidden">AI</span>
        </>
      )}
    </button>
  );

  const AISuggestions = ({ field, suggestions, onApply }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mt-2 p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-900">
          <Wand2 size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>AI Suggestions:</span>
        </div>
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-white p-2 rounded border border-purple-100">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">{suggestion}</p>
            <button
              onClick={() => onApply(suggestion)}
              className="text-xs px-2 sm:px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Apply This
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Advanced Text Editor Functions
  const openEditor = (fieldName, currentValue, config = {}) => {
    setEditorValue(currentValue || '');
    setEditorConfig(config);
    setEditorOpen(fieldName);
  };

  const handleEditorSave = (newValue) => {
    // Apply based on field type
    if (editorOpen === 'summary') {
      handleSummaryChange(newValue);
    } else if (editorOpen && editorOpen.startsWith('experience-')) {
      const index = parseInt(editorOpen.split('-')[1]);
      handleExperienceChange(index, 'description', newValue);
    } else if (editorOpen && editorOpen.startsWith('project-')) {
      const index = parseInt(editorOpen.split('-')[1]);
      handleProjectChange(index, 'description', newValue);
    } else if (editorOpen && editorOpen.startsWith('education-')) {
      const index = parseInt(editorOpen.split('-')[1]);
      handleEducationChange(index, 'description', newValue);
    } else if (editorOpen && editorOpen.startsWith('award-')) {
      const index = parseInt(editorOpen.split('-')[1]);
      handleAwardChange(index, 'description', newValue);
    }

    setEditorOpen(null);
    setEditorValue('');
  };

  const handleEditorClose = () => {
    setEditorOpen(null);
    setEditorValue('');
  };

  const handlePersonalChange = (field, value) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    onChange({ ...data, summary: value });
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    onChange({ ...data, skills });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...(data.experience || [])];
    newExperience[index] = { ...newExperience[index], [field]: value };
    onChange({ ...data, experience: newExperience });
  };

  const addExperience = () => {
    const currentCount = (data.experience || []).length;

    // Dynamic limit based on current content
    if (currentCount >= 10) {
      toast.error('Maximum 10 experiences allowed');
      return;
    }

    // Warning if getting too many
    if (currentCount >= 7) {
      toast('⚠️ Many positions! Descriptions will be auto-shortened to fit one page.', {
        icon: '📝',
        duration: 3000
      });
    }

    onChange({
      ...data,
      experience: [
        ...(data.experience || []),
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExperience = [...(data.experience || [])];
    newExperience.splice(index, 1);
    onChange({ ...data, experience: newExperience });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(data.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    onChange({ ...data, education: newEducation });
  };

  const addEducation = () => {
    if ((data.education || []).length >= 2) {
      toast.error('Maximum 2 education entries allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      education: [
        ...(data.education || []),
        {
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          gpa: '',
          description: ''
        }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEducation = [...(data.education || [])];
    newEducation.splice(index, 1);
    onChange({ ...data, education: newEducation });
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    onChange({ ...data, projects: newProjects });
  };

  const addProject = () => {
    if ((data.projects || []).length >= 3) {
      toast.error('Maximum 3 projects allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        {
          name: '',
          technologies: '',
          description: '',
          link: ''
        }
      ]
    });
  };

  const removeProject = (index) => {
    const newProjects = [...(data.projects || [])];
    newProjects.splice(index, 1);
    onChange({ ...data, projects: newProjects });
  };

  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...(data.certifications || [])];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    onChange({ ...data, certifications: newCertifications });
  };

  const addCertification = () => {
    if ((data.certifications || []).length >= 3) {
      toast.error('Maximum 3 certifications allowed for one-page resume');
      return;
    }
    onChange({
      ...data,
      certifications: [
        ...(data.certifications || []),
        {
          name: '',
          organization: '',
          date: '',
          link: ''
        }
      ]
    });
  };

  const removeCertification = (index) => {
    const newCertifications = [...(data.certifications || [])];
    newCertifications.splice(index, 1);
    onChange({ ...data, certifications: newCertifications });
  };

  // Languages handlers
  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...(data.languages || [])];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    onChange({ ...data, languages: newLanguages });
  };

  const addLanguage = () => {
    if ((data.languages || []).length >= 5) {
      toast.error('Maximum 5 languages allowed for one-page resume');
      return;
    }

    onChange({
      ...data,
      languages: [
        ...(data.languages || []),
        {
          language: '',
          proficiency: 'Professional'
        }
      ]
    });
  };

  const removeLanguage = (index) => {
    const newLanguages = [...(data.languages || [])];
    newLanguages.splice(index, 1);
    onChange({ ...data, languages: newLanguages });
  };

  // Awards handlers
  const handleAwardChange = (index, field, value) => {
    const newAwards = [...(data.awards || [])];
    newAwards[index] = { ...newAwards[index], [field]: value };
    onChange({ ...data, awards: newAwards });
  };

  const addAward = () => {
    if ((data.awards || []).length >= 3) {
      toast.error('Maximum 3 awards allowed for one-page resume');
      return;
    }

    onChange({
      ...data,
      awards: [
        ...(data.awards || []),
        {
          title: '',
          issuer: '',
          date: '',
          description: ''
        }
      ]
    });
  };

  const removeAward = (index) => {
    const newAwards = [...(data.awards || [])];
    newAwards.splice(index, 1);
    onChange({ ...data, awards: newAwards });
  };

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: '👤' },
    { id: 'summary', label: 'Professional Summary', icon: '📝' },
    { id: 'experience', label: 'Work Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'certifications', label: 'Certifications', icon: '📜' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'awards', label: 'Awards & Honors', icon: '🏆' }
  ];

  // Section Header Component
  const SectionHeader = ({ section }) => {
    const completion = getSectionCompletion(section.id);
    const isExpanded = !collapsedSections[section.id];
    const isCompleted = completion >= 80;

    return (
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-gray-100 hover:to-gray-50 transition-all rounded-t-lg"
        onClick={() => toggleSection(section.id)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-600'
            }`}>
            {isCompleted ? <CheckCircle size={20} /> : <span className="text-lg">{section.icon}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{section.label}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[200px]">
                <div
                  className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-blue-400'
                    }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{completion}%</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white rounded-lg transition-colors ml-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 w-full">
      <div className="w-full px-2 sm:px-3 py-4 sm:py-6 space-y-4">

        {/* Personal Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[0]} />
          <AnimatePresence>
            {!collapsedSections['personal'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Personal Information</h2>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600">
                        <Sparkles size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">AI-Powered Editing</span>
                        <span className="sm:hidden">AI-Powered</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={data.personal?.name || ''}
                        onChange={(e) => handlePersonalChange('name', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          Job Title / Professional Headline *
                        </label>
                        <AIButton
                          field="jobTitle"
                          onClick={() => enhanceWithAI('jobTitle', data.personal?.jobTitle || '', {
                            name: data.personal?.name,
                            experience: data.experience
                          })}
                          disabled={!data.personal?.name}
                        />
                      </div>
                      <input
                        type="text"
                        value={data.personal?.jobTitle || ''}
                        onChange={(e) => handlePersonalChange('jobTitle', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Senior Software Engineer"
                      />
                      <AISuggestions
                        field="jobTitle"
                        suggestions={aiSuggestions.jobTitle}
                        onApply={(suggestion) => applySuggestion('jobTitle', suggestion, (val) => handlePersonalChange('jobTitle', val))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={data.personal?.email || ''}
                          onChange={(e) => handlePersonalChange('email', e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={data.personal?.phone || ''}
                          onChange={(e) => handlePersonalChange('phone', e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={data.personal?.location || ''}
                        onChange={(e) => handlePersonalChange('location', e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={data.personal?.linkedin || ''}
                          onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Portfolio / Website
                        </label>
                        <input
                          type="url"
                          value={data.personal?.portfolio || ''}
                          onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="johndoe.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[1]} />
          <AnimatePresence>
            {!collapsedSections['summary'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Professional Summary</h2>
                      <AIButton
                        field="summary"
                        onClick={() => enhanceWithAI('summary', data.summary || '', {
                          jobTitle: data.personal?.jobTitle,
                          experience: data.experience,
                          skills: data.skills
                        })}
                        disabled={!data.personal?.jobTitle}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Write a concise summary highlighting your key achievements and skills. Keep it brief and impactful.
                    </p>

                    <div>
                      {/* Display current summary or placeholder */}
                      <div
                        className="relative w-full min-h-[120px] px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => openEditor('summary', data.summary, {
                          title: 'Professional Summary',
                          disableBullets: false
                        })}
                      >
                        {data.summary ? (
                          <p className="whitespace-pre-wrap text-gray-900 pr-8">{data.summary}</p>
                        ) : (
                          <p className="text-gray-400 italic">Click to add your professional summary using the Advanced Editor with AI Rephrase and AI Bullets...</p>
                        )}
                      </div>

                      {/* Expand icon to open editor */}
                      <button
                        onClick={() => openEditor('summary', data.summary, {
                          title: 'Professional Summary',
                          disableBullets: false
                        })}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit with Advanced Editor (AI Rephrase + AI Bullets)"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[2]} />
          <AnimatePresence>
            {!collapsedSections['experience'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Work Experience</h2>
                      <button
                        onClick={addExperience}
                        disabled={(data.experience || []).length >= 4}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Experience
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      {(() => {
                        const count = (data.experience || []).length;
                        const suggestedLimit = count <= 3 ? 200 : count <= 5 ? 150 : count <= 7 ? 120 : 100;
                        return `${count} position${count !== 1 ? 's' : ''} added. Write complete descriptions - AI will optimize for one-page fit.`;
                      })()}
                    </p>

                    {(data.experience || []).map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Position {index + 1}</span>
                          <button
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Job Title *
                            </label>
                            <input
                              type="text"
                              value={exp.title || ''}
                              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Senior Software Engineer"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Company *
                            </label>
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Tech Company Inc."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location || ''}
                              onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="New York, NY"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Start Date *
                            </label>
                            <input
                              type="text"
                              value={exp.startDate || ''}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="01/2020"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="text"
                              value={exp.endDate || ''}
                              onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Present"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Description * (2-3 key achievements)
                            </label>
                            <AIButton
                              field={`experience-${index}`}
                              onClick={() => enhanceWithAI(`experience-${index}`, exp.description || '', {
                                title: exp.title,
                                company: exp.company,
                                index
                              })}
                              disabled={!exp.title || !exp.company}
                            />
                          </div>

                          {/* Display current description or placeholder */}
                          <div
                            className="relative w-full min-h-[80px] px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => openEditor(`experience-${index}`, exp.description, {
                              title: `${exp.title || 'Experience'} Description`,
                              disableBullets: false
                            })}
                          >
                            {exp.description ? (
                              <p className="whitespace-pre-wrap text-gray-900 pr-8">{exp.description}</p>
                            ) : (
                              <p className="text-gray-400 italic">Click to add description with Advanced Editor...</p>
                            )}

                            {/* Expand icon */}
                            <button
                              onClick={() => openEditor(`experience-${index}`, exp.description, {
                                title: `${exp.title || 'Experience'} Description`,
                                disableBullets: false
                              })}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit with Advanced Editor (AI Rephrase + AI Bullets)"
                            >
                              <Maximize2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(data.experience || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No experience added yet. Click "Add Experience" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[3]} />
          <AnimatePresence>
            {!collapsedSections['education'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Education</h2>
                      <button
                        onClick={addEducation}
                        disabled={(data.education || []).length >= 2}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Education
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Maximum 2 entries. Include your highest and most relevant degrees only. ({(data.education || []).length}/2 used)
                    </p>

                    {(data.education || []).map((edu, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Education {index + 1}</span>
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Degree *
                          </label>
                          <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Institution *
                          </label>
                          <input
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Stanford University"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={edu.location || ''}
                              onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Stanford, CA"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Graduation Date *
                            </label>
                            <input
                              type="text"
                              value={edu.graduationDate || ''}
                              onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="05/2020"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              GPA (optional)
                            </label>
                            <input
                              type="text"
                              value={edu.gpa || ''}
                              onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="3.8/4.0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Additional Info (Honors, relevant coursework)
                          </label>
                          <textarea
                            value={edu.description || ''}
                            onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Dean's List, Relevant coursework: AI, Machine Learning"
                          />
                        </div>
                      </div>
                    ))}

                    {(data.education || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No education added yet. Click "Add Education" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[4]} />
          <AnimatePresence>
            {!collapsedSections['skills'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Skills</h2>
                      <AIButton
                        field="skills"
                        onClick={() => enhanceWithAI('skills', (data.skills || []).join(', '), {
                          jobTitle: data.personal?.jobTitle,
                          experience: data.experience
                        })}
                        disabled={!data.personal?.jobTitle}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      List your top 15-20 skills, separated by commas. Focus on relevant technical and soft skills.
                    </p>

                    <div>
                      <textarea
                        value={(data.skills || []).join(', ')}
                        onChange={(e) => handleSkillsChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="JavaScript, React, Node.js, Python, AWS, Docker, Git, Agile, Team Leadership, Problem Solving"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {(data.skills || []).length} skills added
                      </p>
                      <AISuggestions
                        field="skills"
                        suggestions={aiSuggestions.skills}
                        onApply={(suggestion) => applySuggestion('skills', suggestion, (val) => handleSkillsChange(val))}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[5]} />
          <AnimatePresence>
            {!collapsedSections['projects'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Projects</h2>
                      <button
                        onClick={addProject}
                        disabled={(data.projects || []).length >= 3}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Project
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Maximum 3 projects. Highlight your most impressive and relevant work. ({(data.projects || []).length}/3 used)
                    </p>

                    {(data.projects || []).map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Project {index + 1}</span>
                          <button
                            onClick={() => removeProject(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Project Name *
                            </label>
                            <input
                              type="text"
                              value={project.name || ''}
                              onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="E-commerce Platform"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Technologies Used
                            </label>
                            <input
                              type="text"
                              value={project.technologies || ''}
                              onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Description *
                            </label>
                            <AIButton
                              field={`project-${index}`}
                              onClick={() => enhanceWithAI(`project-${index}`, project.description || '', {
                                name: project.name,
                                technologies: project.technologies,
                                index
                              })}
                              disabled={!project.name}
                            />
                          </div>
                          <textarea
                            value={project.description || ''}
                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Built full-stack e-commerce platform handling 10K+ daily users. Implemented payment gateway, inventory management, and real-time analytics."
                          />
                          <AISuggestions
                            field={`project-${index}`}
                            suggestions={aiSuggestions[`project-${index}`]}
                            onApply={(suggestion) => {
                              applySuggestion(`project-${index}`, suggestion, (val) => handleProjectChange(index, 'description', val));
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Project Link (optional)
                          </label>
                          <input
                            type="url"
                            value={project.link || ''}
                            onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>
                    ))}

                    {(data.projects || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No projects added yet. Click "Add Project" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Certifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[6]} />
          <AnimatePresence>
            {!collapsedSections['certifications'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Certifications</h2>
                      <button
                        onClick={addCertification}
                        disabled={(data.certifications || []).length >= 3}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Certification
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Maximum 3 certifications. Include only industry-recognized and relevant certifications. ({(data.certifications || []).length}/3 used)
                    </p>

                    {(data.certifications || []).map((cert, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Certification {index + 1}</span>
                          <button
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Certification Name *
                            </label>
                            <input
                              type="text"
                              value={cert.name || ''}
                              onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="AWS Certified Solutions Architect"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Issuing Organization *
                            </label>
                            <input
                              type="text"
                              value={cert.organization || ''}
                              onChange={(e) => handleCertificationChange(index, 'organization', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Amazon Web Services"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Issue Date *
                            </label>
                            <input
                              type="text"
                              value={cert.date || ''}
                              onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="06/2023"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Credential Link (optional)
                            </label>
                            <input
                              type="url"
                              value={cert.link || ''}
                              onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://credentials.com/verify/123"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(data.certifications || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No certifications added yet. Click "Add Certification" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Languages Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[7]} />
          <AnimatePresence>
            {!collapsedSections['languages'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Languages</h2>
                      <button
                        onClick={addLanguage}
                        disabled={(data.languages || []).length >= 5}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Language
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Maximum 5 languages. List languages you can communicate effectively in. ({(data.languages || []).length}/5 used)
                    </p>

                    {(data.languages || []).map((lang, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Language {index + 1}</span>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Language *
                            </label>
                            <input
                              type="text"
                              value={lang.language || ''}
                              onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="English, Spanish, Mandarin, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Proficiency Level *
                            </label>
                            <select
                              value={lang.proficiency || 'Professional'}
                              onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Native">Native / Bilingual</option>
                              <option value="Professional">Professional Working</option>
                              <option value="Conversational">Conversational</option>
                              <option value="Basic">Basic / Elementary</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(data.languages || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No languages added yet. Click "Add Language" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Awards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        >
          <SectionHeader section={sections[8]} />
          <AnimatePresence>
            {!collapsedSections['awards'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 space-y-4 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-xl font-bold text-gray-900">Awards & Honors</h2>
                      <button
                        onClick={addAward}
                        disabled={(data.awards || []).length >= 3}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Award
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Maximum 3 awards. Include significant achievements, honors, or recognitions. ({(data.awards || []).length}/3 used)
                    </p>

                    {(data.awards || []).map((award, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Award {index + 1}</span>
                          <button
                            onClick={() => removeAward(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Award Title *
                            </label>
                            <input
                              type="text"
                              value={award.title || ''}
                              onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Employee of the Year, Dean's List"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Issuing Organization *
                              </label>
                              <input
                                type="text"
                                value={award.issuer || ''}
                                onChange={(e) => handleAwardChange(index, 'issuer', e.target.value)}
                                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Company, Institution, Organization"
                              />
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Date Received *
                              </label>
                              <input
                                type="text"
                                value={award.date || ''}
                                onChange={(e) => handleAwardChange(index, 'date', e.target.value)}
                                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="MM/YYYY or Year"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Description (optional)
                            </label>
                            <textarea
                              value={award.description || ''}
                              onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="Brief context or significance of this award..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(data.awards || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No awards added yet. Click "Add Award" to start.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Advanced Text Editor Modal */}
      <AdvancedTextEditor
        value={editorValue}
        onChange={handleEditorSave}
        onClose={handleEditorClose}
        placeholder={`Enter ${editorConfig.title || 'text'}...`}
        title={editorConfig.title || 'Edit Text'}
        fieldName={editorOpen || 'field'}
        isOpen={editorOpen !== null}
        disableAIBullets={editorConfig.disableBullets || false}
        userId={userId}
        resumeId={resumeId}
        fieldPath={editorOpen}
        isPremium={userPlan === 'premium'}
        isBasicPlan={userPlan === 'basic'}
        isOneDayPlan={userPlan === 'oneDay'}
        aiRephraseUses={aiRephraseUses}
        aiBulletsUses={aiBulletsUses}
        onAIRephraseUse={() => setAiRephraseUses(prev => prev + 1)}
        onAIBulletsUse={() => setAiBulletsUses(prev => prev + 1)}
      />
    </div>
  );
}
