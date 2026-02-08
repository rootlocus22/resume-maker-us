"use client";
import { useCallback, useMemo, memo, useState, useEffect } from "react";

// Placeholder image for when no photo is uploaded
const PLACEHOLDER_PHOTO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE4MCAxNDBMMjAwIDEyMEwyMjAgMTQwTDIwMCAxNjBMMTgwIDE0MFoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkFkZCBQaG90bzwvdGV4dD4KPC9zdmc+";
import { Plus, Trash2, ChevronDown, ChevronUp, Bot, Target, CheckCircle, Star, TrendingUp, Award, Zap, ArrowUpDown, Clock, Save, Upload, ImagePlus } from "lucide-react";
import { event } from "../lib/gtag";
import toast from "react-hot-toast";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { debounce } from "lodash";
import { parse, isValid, format } from "date-fns";
import { rankResume } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getEffectivePricing } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import UndoableTextarea from "./UndoableTextarea";

// Common date formats for parsing
const COMMON_FORMATS = [
  'MMM dd, yyyy', // e.g., May 26, 2026
  'MMM yyyy',     // e.g., May 2026
  'MMMM yyyy',    // e.g., May 2026
  'MM/yyyy',      // e.g., 05/2025
  'MM-yyyy',      // e.g., 05-2025
  'yyyy-MM',      // e.g., 2026-05
  'yyyy/MM',      // e.g., 2026/05
  'yyyy',         // e.g., 2026
  'yyyy/MM/dd',   // e.g., 2026/05/26
  'yyyy-MM-dd',   // e.g., 2026-05-26
  'dd/MM/yyyy',   // e.g., 26/05/2025
  'dd-MM-yyyy',   // e.g., 26-05-2025
];

// Debounced event tracking for performance
const debouncedEvent = debounce((action, category, label, value) => {
  event({ action, category, label, value });
}, 500);

// Utility to parse dates into YYYY-MM-DD format
const tryParseDate = (dateStr) => {
  if (!dateStr) return '';
  // Handle objects by returning empty string
  if (typeof dateStr === 'object') return '';
  // Handle 'Present' (case-insensitive) for ongoing jobs/education
  if (typeof dateStr === 'string' && dateStr.trim().toLowerCase() === 'present') {
    return '';
  }
  // Try parsing with date-fns for each format
  for (const fmt of COMMON_FORMATS) {
    try {
      const parsed = parse(dateStr, fmt, new Date());
      if (isValid(parsed)) {
        return format(parsed, 'yyyy-MM-dd'); // Format as YYYY-MM-DD for <input type="date">
      }
    } catch { }
  }
  // Fallback to Date constructor
  const fallback = new Date(dateStr);
  if (isValid(fallback)) {
    return format(fallback, 'yyyy-MM-dd');
  }
  console.warn(`[ResumeForm] Unable to parse date:`, dateStr);
  return ''; // Fallback to empty string if parsing fails
};

// Default dates for new entries (based on current date: May 26, 2026)
const DEFAULT_END_DATE = "2025-05-26"; // Current date
const DEFAULT_START_DATE = "2024-05-26"; // One year prior

// Personal Info Section Component
const PersonalInfoSection = memo(({ data, onChange, t, currentUserId, currentResumeId, onUpdate, rawData }) => {
  const [enabledOptionalFields, setEnabledOptionalFields] = useState({
    dateOfBirth: !!data.dateOfBirth,
    gender: !!data.gender,
    maritalStatus: !!data.maritalStatus
  });

  const [isOptionalSectionExpanded, setIsOptionalSectionExpanded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Update enabled fields only on initial load (not on every data change)
  useEffect(() => {
    if (isInitialLoad) {
      setEnabledOptionalFields({
        dateOfBirth: !!data.dateOfBirth,
        gender: !!data.gender,
        maritalStatus: !!data.maritalStatus
      });
      setIsInitialLoad(false);
    }
  }, [data.dateOfBirth, data.gender, data.maritalStatus, isInitialLoad]);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
    debouncedEvent("input_change", "ResumeForm", field, value.length || value);
  };

  const toggleOptionalField = (fieldName) => {
    const newEnabled = !enabledOptionalFields[fieldName];
    setEnabledOptionalFields(prev => ({ ...prev, [fieldName]: newEnabled }));

    if (!newEnabled) {
      // Clear the field value when disabled
      handleChange(fieldName, "");
    }
  };


  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show loading state with preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // Temporarily show preview while uploading
      handleChange("photo", reader.result);
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Firebase Storage if user is logged in
      if (currentUserId) {
        toast.loading('Uploading photo...', { id: 'photo-upload' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', currentUserId);
        formData.append('resumeId', currentResumeId || 'default');

        const response = await fetch('/api/upload-resume-photo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();

        console.log('📸 Photo uploaded to Firebase Storage:', data.url);

        // Update with Firebase Storage URL instead of base64
        handleChange("photo", data.url);

        // Auto-trigger parent update/save so photo persists immediately
        if (onUpdate) {
          const updatedData = { ...rawData, photo: data.url };
          onUpdate(updatedData);
        }

        // Check if this is a saved resume or new one
        if (!currentResumeId || currentResumeId === 'default') {
          toast.success('Photo uploaded! Save your resume to keep the photo.', {
            id: 'photo-upload',
            duration: 5000,
            icon: '📸'
          });
        } else {
          toast.success('Photo uploaded & saved!', {
            id: 'photo-upload',
            icon: '✅'
          });
        }
      }
      // For anonymous users, keep base64 (temporary, won't persist in Firestore)
      else {
        console.log('Anonymous user - photo will not persist across sessions');
        toast.warning('Photo preview only - login to save permanently', { duration: 5000 });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo. Please try again.', { id: 'photo-upload' });
      // Revert to no photo on error
      handleChange("photo", "");
    }
  };

  const isDefaultPhoto = (photoUrl) => {
    // If photoUrl is empty string, it means user explicitly deleted the photo
    if (photoUrl === "") return false;
    // If no photoUrl or it's a LinkedIn photo, it's default
    return !photoUrl || photoUrl.includes("licdn.com") || photoUrl.includes("profile-displayphoto");
  };

  const hasPhoto = (photoUrl) => {
    // Check if there's any photo (including default/placeholder)
    // Empty string means explicitly deleted, so no photo
    return photoUrl && photoUrl !== "";
  };

  const shouldShowPhoto = (photoUrl) => {
    // Show photo if there's a photo URL (including default) or if no photo is set (show default)
    // Only hide if explicitly deleted (empty string)
    return photoUrl !== "";
  };

  return (
    <div className="space-y-4">
      {/* Main Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {[
          { name: "name", label: t.name, type: "text" },
          { name: "jobTitle", label: t.jobTitle, type: "text" },
          { name: "email", label: t.email, type: "email" },
          { name: "phone", label: t.phone, type: "tel" },
          { name: "address", label: t.address, type: "text" },
          { name: "dateOfBirth", label: t.dateOfBirth, type: "date", optional: true },
          {
            name: "gender", label: t.gender, type: "select", optional: true, options: [
              { value: "", label: t.selectGender },
              { value: "Male", label: t.male },
              { value: "Female", label: t.female },
              { value: "Other", label: t.other }
            ]
          },
          {
            name: "maritalStatus", label: t.maritalStatus, type: "select", optional: true, options: [
              { value: "", label: t.selectMaritalStatus },
              { value: "Single", label: t.single },
              { value: "Married", label: t.married },
              { value: "Divorced", label: t.divorced },
              { value: "Widowed", label: t.widowed }
            ]
          },
          { name: "linkedin", label: t.linkedin, type: "url" },
          { name: "portfolio", label: t.portfolio, type: "url" },
          { name: "photo", label: t.photo, type: "file" },
        ].filter(field => !field.optional || enabledOptionalFields[field.name]).map((field) => (
          <div key={field.name} className={field.name === "photo" ? "md:col-span-2" : ""}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              {field.optional && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange(field.name, "");
                    toggleOptionalField(field.name);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                  title="Remove this field"
                >
                  Remove
                </button>
              )}
            </div>
            {field.type === "file" ? (
              <div className="space-y-3">
                {/* Photo Preview & Status */}
                {shouldShowPhoto(data.photo) ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    {/* Larger Preview */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={data.photo || PLACEHOLDER_PHOTO}
                        alt="Profile Preview"
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-3 shadow-md ${isDefaultPhoto(data.photo) ? 'border-slate-200' : 'border-green-400'
                          }`}
                      />
                      {isDefaultPhoto(data.photo) && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0B1F3B] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <ImagePlus size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex-1 min-w-0">
                      {isDefaultPhoto(data.photo) ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900">Default Photo Active</p>
                          <p className="text-xs text-gray-600">Upload your photo for a more personalized resume</p>
                          <div className="flex gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0B1F3B] text-white text-xs font-medium rounded-md hover:bg-[#071429] cursor-pointer transition-colors">
                              <Upload size={14} />
                              Upload Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              onClick={() => handleChange("photo", "")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <p className="text-sm font-semibold text-gray-900">Custom Photo</p>
                          </div>
                          <p className="text-xs text-gray-600">Your personal photo will appear on your resume</p>
                          <div className="flex gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-xs font-medium rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                              <Upload size={14} />
                              Replace
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              onClick={() => handleChange("photo", "")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <label className="block">
                    <div className="relative group cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all hover:border-teal-400 hover:bg-slate-50/50 group-hover:shadow-md">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <ImagePlus size={28} className="text-[#0B1F3B]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}

                {/* Help Text */}
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-[#0B1F3B] rounded-full"></span>
                  Professional headshot recommended for best results
                </p>
              </div>
            ) : field.type === "select" ? (
              <select
                value={data[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B]"
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={data[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B]"
                placeholder={field.label}
              />
            )}
          </div>
        ))}
      </div>

      {/* Optional Fields - Inline Toggle Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { key: "dateOfBirth", label: t.dateOfBirth, icon: "📅" },
          { key: "gender", label: t.gender, icon: "👤" },
          { key: "maritalStatus", label: t.maritalStatus, icon: "💍" }
        ].map((field) => (
          !enabledOptionalFields[field.key] && (
            <button
              key={field.key}
              type="button"
              onClick={() => toggleOptionalField(field.key)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0B1F3B] bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors group"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
              <span>{field.icon}</span>
              <span>Add {field.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
});

// Summary Section Component
const SummarySection = memo(({ value, onChange, t, generateAISuggestion, isLoadingAI, currentUserId, currentResumeId, isPremium, isBasicPlan, isOneDayPlan, aiRephraseUses, aiBulletsUses, onAIRephraseUse, onAIBulletsUse }) => {
  // Ensure value is a string to avoid uncontrolled input warning
  const safeValue = typeof value === "string" ? value : "";

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{t.summary}</label>
        <button
          onClick={() => generateAISuggestion("summary", safeValue || "Software Engineer")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white text-xs font-medium rounded-md hover:from-[#071429] hover:to-[#008C81] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate AI-powered professional summary"
          disabled={isLoadingAI}
        >
          {isLoadingAI ? (
            <>
              <svg
                className="animate-spin h-3.5 w-3.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>AI Enhance</span>
            </>
          )}
        </button>
      </div>
      <UndoableTextarea
        value={safeValue}
        onChange={onChange}
        placeholder={t.summaryPlaceholder}
        height="h-32"
        showToolbar={true}
        disabled={isLoadingAI}
        title="Professional Summary"
        fieldName="summary"
        disableAIBullets={true}
        userId={currentUserId}
        resumeId={currentResumeId}
        fieldPath="profile.summary"
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
});

// Array Item Component (for experience, education, etc.)
const ArrayItem = memo(({ section, item, index, onChange, onRemove, fields, t, generateAISuggestion, isLoadingAI: parentIsLoadingAI, userId, anonymousBulletUses, setAnonymousBulletUses, isPremium, currentUserId, currentResumeId, isBasicPlan, isOneDayPlan, aiRephraseUses, onAIRephraseUse, onAIBulletsUse }) => {
  const [isLoadingAIBullets, setIsLoadingAIBullets] = useState(false);

  // Safety check: ensure item is always an object
  const safeItem = typeof item === 'object' && item !== null ? item : {};



  // Helper to check if text has bullets
  const hasBullets = (text) => {
    const value = Array.isArray(text) ? text.join('\n') : (text || "");
    return /^[•\-\*]\s/m.test(value);
  };

  const handleFieldChange = (field, value) => {

    onChange(index, { ...safeItem, [field]: value });
    debouncedEvent("array_input_change", "ResumeForm", section, index);
  };

  return (
    <div className={section === 'skills' ? 'p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-slate-300 hover:shadow-md transition duration-200' : 'p-2 border border-gray-200 rounded-lg bg-gray-50'}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={section === 'skills' ? 'text-xs font-bold text-[#0B1F3B] uppercase tracking-wider' : 'text-sm font-medium text-gray-800'}>{section.slice(0, -1)} #{index + 1}</h4>
        <button onClick={() => onRemove(index)} className={section === 'skills' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors' : 'text-red-500 hover:text-red-700 transition-colors'}>
          <Trash2 size={18} />
        </button>
      </div>
      <div className={section === 'skills' ? 'w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-2'}>
        {fields.map((field) => (
          (!field.conditional || field.conditional(safeItem)) && (
            <div key={field.name} className="relative">
              {section !== 'skills' && <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>}
              {field.type === "textarea" ? (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    {(field.name === "description" || field.name === "achievements") && (
                      <button
                        type="button"
                        onClick={() => {
                          const fieldValue = safeItem[field.name];
                          const currentValue = Array.isArray(fieldValue) ? fieldValue.join('\n') : (fieldValue || "");

                          console.log('Toggle clicked:', field.name, 'Current value:', currentValue);

                          // Check if has bullets at line start
                          if (/^[•\-\*]\s/m.test(currentValue)) {
                            // Convert bullet points to paragraph format with proper sentences
                            const cleanedLines = currentValue
                              .split("\n")
                              .map(line => line.replace(/^[-•*]\s*/, "").trim())
                              .filter(line => line.length > 0);

                            // Join with proper spacing for paragraph format
                            const paragraphText = cleanedLines
                              .map(line => line.trim())
                              .join(' ');

                            // Store as string and log
                            console.log('Converting to paragraph:', paragraphText);
                            handleFieldChange(field.name, paragraphText);
                          } else {
                            // Convert paragraph/regular text to bullet points
                            let lines;

                            // If it's a single paragraph, split by sentences
                            if (!currentValue.includes('\n') && currentValue.includes('.')) {
                              // Split by sentence-ending punctuation
                              lines = currentValue
                                .split(/[.!?]+/)
                                .map(sentence => sentence.trim())
                                .filter(sentence => sentence.length > 0);
                            } else {
                              // Split by lines (existing logic)
                              lines = currentValue
                                .split("\n")
                                .map(line => line.trim())
                                .filter(line => line.length > 0);
                            }

                            if (lines.length > 0) {
                              const bulletText = lines.map(line => {
                                // Clean up the line and ensure it doesn't end with period for bullets
                                const cleanLine = line.replace(/[.!?]+$/, '').trim();
                                return `• ${cleanLine}`;
                              }).join('\n');

                              // Store as string and log
                              console.log('Converting to bullets:', bulletText);
                              handleFieldChange(field.name, bulletText);
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-teal-400 transition-all group"
                        title={hasBullets(safeItem[field.name]) ? "Convert to paragraph" : "Convert to bullet points"}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#0B1F3B] transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {hasBullets(safeItem[field.name]) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          ) : (
                            <>
                              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 12h10" />
                              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h10" />
                              <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 18h10" />
                            </>
                          )}
                        </svg>
                        <span className="hidden sm:inline">{hasBullets(safeItem[field.name]) ? "Paragraph" : "Bullets"}</span>
                      </button>
                    )}
                    {field.name === "description" && (
                      <button
                        type="button"
                        onClick={async () => {


                          // Check if user is not premium and has reached limit
                          if (!isPremium && anonymousBulletUses >= 5) {
                            toast.error("Free users have a limit of 5 AI bullet generations. Premium users get unlimited access!", {
                              duration: 6000,
                              action: {
                                label: 'Upgrade Now',
                                onClick: () => handleUpgradeClick('basic', 'ai-bullets')
                              }
                            });
                            return;
                          }

                          setIsLoadingAIBullets(true);
                          try {
                            const response = await fetch("/api/generate-bullets", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text: Array.isArray(safeItem[field.name]) ? safeItem[field.name].join('\n') : (safeItem[field.name] || "") }),
                            });
                            const { bullets, error } = await response.json();
                            if (bullets && Array.isArray(bullets)) {
                              // For description fields, store as array of lines
                              if (field.name === 'description') {
                                handleFieldChange(field.name, bullets.map(b => `• ${b}`));
                              } else {
                                handleFieldChange(field.name, bullets.map(b => `• ${b}`).join('\n'));
                              }

                              // Increment usage count for non-premium users
                              if (!isPremium) {
                                const newCount = anonymousBulletUses + 1;
                                setAnonymousBulletUses(newCount);
                                localStorage.setItem("anonymousBulletUses", newCount);

                                // Show different messages based on usage count
                                if (newCount === 5) {
                                  toast.success("AI bullets generated! You've used all 5 free AI bullet generations. Upgrade for unlimited access!");
                                } else {
                                  toast.success(`AI bullets generated! ${5 - newCount} free generation${5 - newCount > 1 ? 's' : ''} remaining.`);
                                }
                              } else {
                                toast.success("AI bullets generated!");

                                // Show AI content review notification
                                toast.custom(
                                  (t) => (
                                    <div
                                      className={`${t.visible ? 'animate-enter' : 'animate-leave'
                                        } max-w-md w-full bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200 ring-opacity-5 border border-slate-300`}
                                    >
                                      <div className="flex-1 w-0 p-4">
                                        <div className="flex items-start">
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                              <svg className="w-4 h-4 text-[#0B1F3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            </div>
                                          </div>
                                          <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-[#0B1F3B]">
                                              AI Content Applied
                                            </p>
                                            <p className="mt-1 text-sm text-[#0B1F3B]">
                                              Please review and edit the suggestions to ensure they accurately reflect your experience.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex border-l border-slate-200">
                                        <button
                                          onClick={() => toast.dismiss(t.id)}
                                          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#0B1F3B] hover:text-teal-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B]"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                  {
                                    duration: 3000,
                                    position: 'top-right',
                                    id: 'ai-content-review',
                                  }
                                );
                              }
                            } else {
                              toast.error(error || "Failed to generate bullets");
                            }
                          } catch (e) {
                            toast.error("Error generating bullets");
                          } finally {
                            setIsLoadingAIBullets(false);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-slate-100 text-[#0B1F3B] rounded border hover:bg-slate-200 transition-colors ml-2"
                        title="Generate AI Bullet Points"
                        disabled={isLoadingAIBullets}
                      >
                        {isLoadingAIBullets ? "Generating..." : "AI Bullets"}
                      </button>
                    )}
                  </div>
                  <UndoableTextarea
                    value={(() => {
                      const fieldValue = safeItem[field.name];
                      if (typeof fieldValue === 'object' && fieldValue !== null) {
                        // For skills, extract the name property
                        if (field.name === 'name' && fieldValue.name) {
                          return fieldValue.name;
                        }
                        // For description/achievements fields, handle array of strings
                        if ((field.name === 'description' || field.name === 'achievements') && Array.isArray(fieldValue)) {
                          // Add bullet points when joining array to match preview rendering
                          return fieldValue
                            .filter(line => line && String(line).trim())
                            .map(line => {
                              const trimmed = String(line).trim();
                              // Only add bullet if line doesn't already have one
                              return /^[•\-\*]\s/.test(trimmed) ? trimmed : `• ${trimmed}`;
                            })
                            .join('\n');
                        }
                        return '';
                      }
                      // For string values, return them directly
                      return fieldValue || "";
                    })()}
                    onChange={(value) => {
                      // Let the toggle button handle format conversion
                      // Store the value as-is (string)
                      handleFieldChange(field.name, value);
                    }}
                    height="h-24"
                    placeholder={field.label}
                    showToolbar={field.name === 'description' || field.name === 'achievements'}
                    disabled={parentIsLoadingAI}
                    title={`${field.label} Editor`}
                    fieldName={field.name}
                    userId={currentUserId}
                    resumeId={currentResumeId}
                    fieldPath={`${section}.${index}.${field.name}`}
                    isPremium={isPremium}
                    isBasicPlan={isBasicPlan}
                    isOneDayPlan={isOneDayPlan}
                    aiRephraseUses={aiRephraseUses}
                    aiBulletsUses={anonymousBulletUses}
                    onAIRephraseUse={onAIRephraseUse}
                    onAIBulletsUse={onAIBulletsUse}
                  />
                  {field.aiPowered && (
                    <button
                      onClick={() => generateAISuggestion(section, `${safeItem.jobTitle || ""} at ${safeItem.company || ""}`, index)}
                      className="absolute bottom-2 right-2 p-1.5 bg-slate-100 rounded-md text-[#0B1F3B] hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t.aiSuggest}
                      disabled={parentIsLoadingAI}
                    >
                      {parentIsLoadingAI ? (
                        <svg
                          className="animate-spin h-4 w-4 text-[#0B1F3B]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <Bot size={18} />
                      )}
                    </button>
                  )}
                </div>
              ) : field.type === "select" ? (
                <select
                  value={(() => {
                    const fieldValue = safeItem[field.name];
                    if (typeof fieldValue === 'object' && fieldValue !== null) {
                      // For skills, extract the proficiency property
                      if (field.name === 'proficiency' && fieldValue.proficiency) {
                        return fieldValue.proficiency;
                      }
                      return field.options[0].value;
                    }
                    return fieldValue || field.options[0].value;
                  })()}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] bg-white"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : field.name === "endDate" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={tryParseDate((() => {
                        const fieldValue = safeItem[field.name];
                        if (typeof fieldValue === 'object' && fieldValue !== null) {
                          return '';
                        }
                        return fieldValue;
                      })())}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={(() => {
                        const fieldValue = safeItem[field.name];
                        return typeof fieldValue === 'string' && fieldValue?.trim().toLowerCase() === 'present';
                      })()}
                    />
                  </div>

                  {/* Present Checkbox + Quick Presets */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={(() => {
                          const fieldValue = safeItem[field.name];
                          return typeof fieldValue === 'string' && fieldValue?.trim().toLowerCase() === 'present';
                        })()}
                        onChange={(e) => {
                          handleFieldChange(field.name, e.target.checked ? 'Present' : '');
                        }}
                        className="w-4 h-4 text-[#0B1F3B] rounded focus:ring-2 focus:ring-[#0B1F3B] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-[#0B1F3B] transition-colors">
                        I currently work here
                      </span>
                    </label>

                    {/* Quick Date Presets */}
                    {!(() => {
                      const fieldValue = safeItem[field.name];
                      return typeof fieldValue === 'string' && fieldValue?.trim().toLowerCase() === 'present';
                    })() && (
                        <div className="flex gap-1">
                          {[
                            { label: '1M', months: 1 },
                            { label: '3M', months: 3 },
                            { label: '6M', months: 6 },
                            { label: '1Y', years: 1 }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                const date = new Date();
                                if (preset.months) {
                                  date.setMonth(date.getMonth() - preset.months);
                                } else if (preset.years) {
                                  date.setFullYear(date.getFullYear() - preset.years);
                                }
                                const formattedDate = date.toISOString().split('T')[0];
                                handleFieldChange(field.name, formattedDate);
                              }}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-slate-100 hover:text-[#0B1F3B] transition-colors"
                              title={`${preset.months ? preset.months + ' months' : preset.years + ' year'} ago`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ) : field.type === "month" || field.type === "date" ? (
                <input
                  type="date"
                  value={tryParseDate((() => {
                    const fieldValue = safeItem[field.name];
                    if (typeof fieldValue === 'object' && fieldValue !== null) {
                      return '';
                    }
                    return fieldValue;
                  })())}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B]"
                />
              ) : (
                <input
                  type={field.type}
                  value={(() => {
                    const fieldValue = safeItem[field.name];
                    if (typeof fieldValue === 'object' && fieldValue !== null) {
                      // For skills, extract the name property for text inputs
                      if (field.name === 'name' && fieldValue.name) {
                        return fieldValue.name;
                      }
                      return '';
                    }
                    return fieldValue || "";
                  })()}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()} // Fix: Prevent dnd-kit from capturing space bar
                  onPointerDown={(e) => e.stopPropagation()} // Fix: Prevent drag start on click
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  className={section === 'skills' ? 'w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B]' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B]'}
                  placeholder={field.placeholder || field.label}
                  max={field.max}
                  min={field.min}
                />
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
});

// Array Section Component (e.g., Experience, Education)
const ArraySection = memo(({ section, items, onChange, onAdd, onRemove, fields, t, generateAISuggestion, isLoadingAI, userId, anonymousBulletUses, setAnonymousBulletUses, isPremium, currentUserId, currentResumeId, isBasicPlan, isOneDayPlan, aiRephraseUses, onAIRephraseUse, onAIBulletsUse, sortable, onSort }) => {
  return (
    <>
      <div className={section === 'skills' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
        {items.map((item, index) => (
          <ArrayItem
            key={index}
            section={section}
            item={item}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
            fields={fields}
            t={t}
            generateAISuggestion={generateAISuggestion}
            isLoadingAI={isLoadingAI}
            userId={userId}
            anonymousBulletUses={anonymousBulletUses}
            setAnonymousBulletUses={setAnonymousBulletUses}
            isPremium={isPremium}
            currentUserId={currentUserId}
            currentResumeId={currentResumeId}
            isBasicPlan={isBasicPlan}
            isOneDayPlan={isOneDayPlan}
            aiRephraseUses={aiRephraseUses}
            onAIRephraseUse={onAIRephraseUse}
            onAIBulletsUse={onAIBulletsUse}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-3 bg-[#0B1F3B] text-white rounded-md hover:bg-[#071429] transition-colors text-sm font-medium"
        >
          <Plus size={16} /> {t[section + "Add"]}
        </button>
        {section === "skills" && (
          <button
            onClick={() => generateAISuggestion(section, items.map(item => (typeof item === 'object' && item.name) ? item.name : String(item)).join(", ") || "Software Engineer")}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-[#0B1F3B] rounded-md hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoadingAI}
          >
            {isLoadingAI ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[#0B1F3B]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Bot size={16} /> {t.aiSuggest}
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
});

// Device detection utility
const detectDevice = () => {
  if (typeof window === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";

  return "desktop";
};

export default function ResumeForm({ data: rawData, onUpdate, language = "en", country = "us", preferences = {}, selectedTemplate = "classic", currentUserId = null, currentResumeId = "default" }) {

  // Normalize legacy data structure (flatten profile object if it exists)
  const data = useMemo(() => {
    let normalized = rawData;

    // 1. Flatten profile structure if it exists
    if (normalized?.profile && typeof normalized.profile === 'object') {
      console.log('📦 ResumeForm: Detected legacy profile structure, flattening...');
      const { profile, ...rest } = normalized;
      normalized = {
        ...profile,
        ...rest,
        // Ensure photo is preserved from profile or root level
        photo: profile.photo || rest.photo || normalized.photo || ""
      };
      console.log('✅ ResumeForm: Flattened profile data, photo preserved:', !!normalized.photo);
    }

    // 2. Normalize experience entries (handle legacy field names)
    if (normalized?.experience && Array.isArray(normalized.experience)) {
      normalized.experience = normalized.experience.map((exp, index) => {
        // Handle different field name variations
        const normalizedExp = { ...exp };

        // Map legacy field names to current schema
        if (!normalizedExp.jobTitle) {
          normalizedExp.jobTitle = exp.position || exp.title || exp.role || exp.jobTitle || "";
        }
        if (!normalizedExp.company) {
          normalizedExp.company = exp.organization || exp.employer || exp.company || "";
        }

        // Log if we found and fixed legacy data
        if (exp.position || exp.title || exp.role) {
          console.log(`📦 ResumeForm: Normalized experience #${index + 1}:`, {
            old: { position: exp.position, title: exp.title, role: exp.role },
            new: { jobTitle: normalizedExp.jobTitle }
          });
        }

        return normalizedExp;
      });
    }

    return normalized;
  }, [rawData]);

  // Normalize skills data to handle both string arrays and object arrays
  const normalizeSkill = (skill) => {


    if (typeof skill === 'string') {
      // Don't trim to allow trailing spaces while typing
      const result = { name: skill, proficiency: null };

      return result;
    } else if (typeof skill === 'object' && skill !== null) {
      const name = skill.name || skill.skill || '';
      const result = {
        name: typeof name === 'string' ? name : '',
        proficiency: skill.proficiency || skill.level || null
      };

      return result;
    } else {
      const result = { name: '', proficiency: null };

      return result;
    }
  };
  const [collapsedSections, setCollapsedSections] = useState({});
  const [userId, setUserId] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [anonymousAIUses, setAnonymousAIUses] = useState(0);
  const [anonymousBulletUses, setAnonymousBulletUses] = useState(0);
  const [aiRephraseUses, setAIRephraseUses] = useState(0);
  const [sectionSortOrders, setSectionSortOrders] = useState({});

  // Auto-save and progress tracking state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get auth context for premium status and plan type
  const { user, isPremium, isBasicPlan, isOneDayPlan } = useAuth();

  // Helper function for consistent upgrade flow
  const handleUpgradeClick = (billingCycle = 'basic', source = 'ai-feature') => {
    if (user) {
      window.location.href = `/checkout?billingCycle=${billingCycle}`;
    } else {
      // Store checkout intent and message in storage
      localStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle, source }));
      sessionStorage.setItem('loginMessage', 'Please login to unlock premium AI features and continue with your purchase');
      window.location.href = `/login`;
    }
  };

  // Get location context for dynamic pricing
  const { currency, isLoadingGeo } = useLocation();

  // Get device-based pricing
  const deviceType = detectDevice();
  const isAndroidDevice = deviceType === "android";
  const effectivePricing = getEffectivePricing(currency, isAndroidDevice);

  // ATS Guidance States
  const [atsScore, setAtsScore] = useState(0);
  const [sectionScores, setSectionScores] = useState({});
  const [completionAnimations, setCompletionAnimations] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);

  // Initialize usage counts from localStorage on component mount
  useEffect(() => {
    const storedUses = parseInt(localStorage.getItem("anonymousAIUses") || "0", 10);
    const storedBulletUses = parseInt(localStorage.getItem("anonymousBulletUses") || "0", 10);
    const storedRephraseUses = parseInt(localStorage.getItem("aiRephraseUses") || "0", 10);
    setAnonymousAIUses(storedUses);
    setAnonymousBulletUses(storedBulletUses);
    setAIRephraseUses(storedRephraseUses);
  }, []);

  // Track data changes for auto-save indicator
  useEffect(() => {
    setHasUnsavedChanges(true);
    setIsSaving(true);

    // Simulate save process (actual save happens in parent component)
    const saveTimer = setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime(new Date());
      setHasUnsavedChanges(false);
    }, 800);

    return () => clearTimeout(saveTimer);
  }, [data]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // Don't reset AI uses for logged-in users - they might still be non-premium
        // Usage will be managed by premium status listener
      } else {
        setUserId(null);
        const storedUses = parseInt(localStorage.getItem("anonymousAIUses") || "0", 10);
        const storedBulletUses = parseInt(localStorage.getItem("anonymousBulletUses") || "0", 10);
        const storedRephraseUses = parseInt(localStorage.getItem("aiRephraseUses") || "0", 10);
        setAnonymousAIUses(storedUses);
        setAnonymousBulletUses(storedBulletUses);
        setAIRephraseUses(storedRephraseUses);
      }
    });
    return () => unsubscribe();
  }, []);

  // Premium status listener - reset usage when user becomes premium
  useEffect(() => {
    if (isPremium) {
      setAnonymousAIUses(0);
      setAnonymousBulletUses(0);
      setAIRephraseUses(0);
      localStorage.setItem("anonymousAIUses", "0");
      localStorage.setItem("anonymousBulletUses", "0");
      localStorage.setItem("aiRephraseUses", "0");
    } else {
      // Load stored usage count for non-premium users
      const storedUses = parseInt(localStorage.getItem("anonymousAIUses") || "0", 10);
      const storedBulletUses = parseInt(localStorage.getItem("anonymousBulletUses") || "0", 10);
      const storedRephraseUses = parseInt(localStorage.getItem("aiRephraseUses") || "0", 10);
      setAnonymousAIUses(storedUses);
      setAnonymousBulletUses(storedBulletUses);
      setAIRephraseUses(storedRephraseUses);
    }
  }, [isPremium]);

  // Callbacks to increment AI usage counts
  const handleAIRephraseUse = useCallback(() => {
    const newCount = aiRephraseUses + 1;
    setAIRephraseUses(newCount);
    localStorage.setItem("aiRephraseUses", newCount.toString());
  }, [aiRephraseUses]);

  const handleAIBulletsUse = useCallback(() => {
    const newCount = anonymousBulletUses + 1;
    setAnonymousBulletUses(newCount);
    localStorage.setItem("anonymousBulletUses", newCount.toString());
  }, [anonymousBulletUses]);

  // Real-time ATS scoring using AI-based scoring for consistency
  const calculateATSScore = useCallback(async (resumeData) => {
    try {
      // For now, use local scoring but log that we should migrate to AI-based scoring

      const result = rankResume(resumeData);
      return {
        score: result.score || 0,
        breakdown: {
          keywords: { score: result.breakdown?.keywords?.score || 0, max: 100 },
          formatting: { score: result.breakdown?.formatting?.score || 0, max: 100 },
          structure: { score: result.breakdown?.structure?.score || 0, max: 100 },
          content: { score: result.breakdown?.content?.score || 0, max: 100 },
          compatibility: { score: result.breakdown?.compatibility?.score || 0, max: 100 }
        }
      };
    } catch (error) {
      console.error('ATS scoring error:', error);
      return {
        score: 0,
        breakdown: {
          keywords: { score: 0, max: 100 },
          formatting: { score: 0, max: 100 },
          structure: { score: 0, max: 100 },
          content: { score: 0, max: 100 },
          compatibility: { score: 0, max: 100 }
        }
      };
    }
  }, []);

  // Update ATS score when data changes
  useEffect(() => {
    const debouncedScoreUpdate = debounce(async () => {
      try {
        const result = await calculateATSScore(data);
        setPreviousScore(atsScore);
        setAtsScore(result.score);
        setSectionScores(result.breakdown);

        // Trigger celebration for score improvements
        if (result.score > atsScore && result.score >= 80) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }

        // Trigger section completion animations
        const newAnimations = {};
        Object.keys(result.breakdown).forEach(section => {
          const sectionScore = result.breakdown[section].score;
          const maxScore = result.breakdown[section].max;
          const completionPercent = (sectionScore / maxScore) * 100;

          if (completionPercent >= 80) {
            newAnimations[section] = true;
            setTimeout(() => {
              setCompletionAnimations(prev => ({ ...prev, [section]: false }));
            }, 2000);
          }
        });

        if (Object.keys(newAnimations).length > 0) {
          setCompletionAnimations(prev => ({ ...prev, ...newAnimations }));
        }
      } catch (error) {
        console.error('Error calculating ATS score:', error);
      }
    }, 500);

    debouncedScoreUpdate();
    return () => debouncedScoreUpdate.cancel();
  }, [data, calculateATSScore]);

  // Generate AI suggestions
  const generateAISuggestion = useCallback(async (field, input, index = null) => {
    if (isLoadingAI) return;
    setIsLoadingAI(true);

    if (!isPremium) {
      if (anonymousAIUses >= 5) {
        // Format price based on currency and device
        const formatPrice = (price, currency) => {
          if (currency === 'USD') {
            return `$${(price / 100).toFixed(2)}`;
          } else {
            return `₹${Math.floor(price / 100)}`;
          }
        };

        // Show loading message if location is still being detected
        if (isLoadingGeo) {
          toast.error("Free users have a limit of 2 AI suggestions. Premium users get unlimited access!", {
            duration: 6000,
            action: {
              label: 'Upgrade Now',
              onClick: () => window.location.href = '/checkout?billingCycle=basic'
            }
          });
        } else {
          const priceText = formatPrice(effectivePricing.basic, effectivePricing.currency);
          const planDuration = effectivePricing.currency === 'USD' ? '30 days' : (isAndroidDevice ? '7 days' : '30 days');

          toast.error(
            `Free users have a limit of 5 AI suggestions. Get unlimited access starting ${priceText} (${planDuration})!`,
            {
              duration: 6000,
              action: {
                label: 'Upgrade Now',
                onClick: () => handleUpgradeClick('basic', 'ai-bullets')
              }
            }
          );
        }
        setIsLoadingAI(false);
        return;
      }

      try {
        const response = await fetch("/api/generate-resume-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId || "anonymous", field, input }),
        });

        if (!response.ok) throw new Error((await response.json()).error || "Failed to generate suggestion");

        const { suggestion } = await response.json();

        if (field === "skills") {
          // Normalize existing skills and prevent duplicates by name (case-insensitive)
          const normalizedExistingSkills = (data.skills || []).map(normalizeSkill);
          const existingSkillNames = normalizedExistingSkills.map(s => (s.name || "").trim().toLowerCase());
          const newSkills = Array.isArray(suggestion)
            ? suggestion
              .filter(skill => {
                const skillName = (skill.name || skill).trim().toLowerCase();
                return skillName && !existingSkillNames.includes(skillName);
              })
              .map(skill => ({ name: skill.name || skill, proficiency: skill.proficiency || "Intermediate" }))
            : [{ name: suggestion, proficiency: "Intermediate" }];
          if (newSkills.length === 0) {
            toast("No new skills to add!");
          } else {
            onUpdate({ ...data, skills: [...data.skills, ...newSkills] });
            toast.success("AI suggestion applied!");
          }
        } else if (index !== null) {
          const updatedArray = [...data[field]];
          updatedArray[index] = { ...updatedArray[index], description: suggestion };
          onUpdate({ ...data, [field]: updatedArray });
        } else {
          onUpdate({ ...data, [field]: suggestion });
        }

        // Show AI content review notification for all successful AI suggestions
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200 ring-opacity-5 border border-slate-300`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#0B1F3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-[#0B1F3B]">
                      AI Content Applied
                    </p>
                    <p className="mt-1 text-sm text-[#0B1F3B]">
                      Please review and edit the suggestions to ensure they accurately reflect your experience.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#0B1F3B] hover:text-teal-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ),
          {
            duration: 3000,
            position: 'top-right',
            id: 'ai-content-review',
          }
        );

        setAnonymousAIUses(prev => {
          const newCount = prev + 1;
          localStorage.setItem("anonymousAIUses", newCount);
          return newCount;
        });

        // Show different messages based on usage count
        const newCount = anonymousAIUses + 1;
        if (newCount === 5) {
          toast.success("AI suggestion applied! You've used all 5 free AI suggestions. Upgrade for unlimited access!");
        } else {
          toast.success(`AI suggestion applied! ${5 - newCount} free suggestion${5 - newCount > 1 ? 's' : ''} remaining.`);
        }
      } catch (error) {
        toast.error(error.message || "Failed to generate AI suggestion.");
      } finally {
        setIsLoadingAI(false);
      }
      return;
    }

    // Premium users get unlimited access
    try {
      const response = await fetch("/api/generate-resume-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field, input }),
      });

      if (!response.ok) throw new Error((await response.json()).error || "Failed to generate suggestion");

      const { suggestion } = await response.json();

      if (field === "skills") {
        // Normalize existing skills and prevent duplicates by name (case-insensitive)
        const normalizedExistingSkills = (data.skills || []).map(normalizeSkill);
        const existingSkillNames = normalizedExistingSkills.map(s => (s.name || "").trim().toLowerCase());
        const newSkills = Array.isArray(suggestion)
          ? suggestion
            .filter(skill => {
              const skillName = (skill.name || skill).trim().toLowerCase();
              return skillName && !existingSkillNames.includes(skillName);
            })
            .map(skill => ({ name: skill.name || skill, proficiency: skill.proficiency || "Intermediate" }))
          : [{ name: suggestion, proficiency: "Intermediate" }];
        if (newSkills.length === 0) {
          toast("No new skills to add!");
        } else {
          onUpdate({ ...data, skills: [...data.skills, ...newSkills] });
          toast.success("AI suggestion applied!");
        }
      } else if (index !== null) {
        const updatedArray = [...data[field]];
        updatedArray[index] = { ...updatedArray[index], description: suggestion };
        onUpdate({ ...data, [field]: updatedArray });
      } else {
        onUpdate({ ...data, [field]: suggestion });
      }

      // Show AI content review notification for all successful AI suggestions
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200 ring-opacity-5 border border-slate-300`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0B1F3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-[#0B1F3B]">
                    AI Content Applied
                  </p>
                  <p className="mt-1 text-sm text-[#0B1F3B]">
                    Please review and edit the suggestions to ensure they accurately reflect your experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#0B1F3B] hover:text-teal-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B1F3B]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ),
        {
          duration: 3000,
          position: 'top-right',
          id: 'ai-content-review',
        }
      );
    } catch (error) {
      toast.error(error.message || "Failed to generate AI suggestion.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [userId, anonymousAIUses, isLoadingAI, data, onUpdate, effectivePricing, isAndroidDevice, isLoadingGeo, isPremium]);

  const toggleSectionCollapse = useCallback((section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ATS Score Header Component
  const ATSScoreHeader = () => {
    const getScoreColor = (score) => {
      if (score >= 90) return "text-[#0B1F3B] bg-slate-50 border-slate-200";
      if (score >= 80) return "text-[#0B1F3B] bg-slate-50 border-slate-200";
      if (score >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
      return "text-red-700 bg-red-50 border-red-200";
    };

    const getScoreIcon = (score) => {
      if (score >= 90) return <Award className="w-4 h-4" />;
      if (score >= 80) return <Star className="w-4 h-4" />;
      if (score >= 60) return <Target className="w-4 h-4" />;
      return <TrendingUp className="w-4 h-4" />;
    };

    const getScoreText = (score) => {
      if (score >= 90) return "Excellent!";
      if (score >= 80) return "Great!";
      if (score >= 60) return "Good";
      return "Needs Work";
    };

    return (
      <div className={`sticky top-0 z-20 mb-4 px-3 py-2 rounded-lg border ${getScoreColor(atsScore)} relative overflow-hidden bg-opacity-95 backdrop-blur-sm shadow-sm`} data-tour="ats-score">
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-[#0B1F3B]/20 to-[#0B1F3B]/20 backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🎉</div>
                <p className="text-sm font-bold text-[#0B1F3B]">Excellent Score!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Section Header with completion indicator
  const SectionHeader = ({ title, sectionKey, completionPercent, tips, sortable, onSort, itemsCount, currentSortOrder = 'newest' }) => {
    const isCompleted = completionPercent >= 80;
    const isAnimating = completionAnimations[sectionKey];

    const handleSort = (e) => {
      e.stopPropagation(); // Prevent section collapse
      if (onSort) {
        onSort();
      }
    };

    return (
      <div
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4 cursor-pointer"
        onClick={() => toggleSectionCollapse(sectionKey)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-[#0B1F3B] text-white" : "bg-gray-300 text-gray-600"
              }`}
          >
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 bg-current rounded-full" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
              {/* Sort Button - Only show if sortable and has 2+ items */}
              {sortable && itemsCount > 1 && (
                <button
                  type="button"
                  onClick={handleSort}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-[#0B1F3B] bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex-shrink-0"
                  title={`Sort: ${currentSortOrder === 'newest' ? 'Newest First (click for Oldest First)' : 'Oldest First (click for Newest First)'}`}
                >
                  <ArrowUpDown size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">{Math.round(completionPercent)}% complete</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {isAnimating && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 text-[#0B1F3B] font-medium"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Great!</span>
            </motion.div>
          )}

          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${completionPercent}%` }}
              className={`h-full rounded-full ${completionPercent >= 80 ? "bg-[#0B1F3B]" :
                completionPercent >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
            />
          </div>

          {collapsedSections[sectionKey] ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    );
  };

  // Translation labels
  const labels = useMemo(() => ({
    en: {
      personalInfo: "Personal Information",
      name: "Full Name",
      jobTitle: "Job Title",
      email: "Email",
      phone: "Phone",
      address: "Address",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      maritalStatus: "Marital Status",
      selectGender: "Select Gender",
      selectMaritalStatus: "Select Marital Status",
      male: "Male",
      female: "Female",
      other: "Other",
      single: "Single",
      married: "Married",
      divorced: "Divorced",
      widowed: "Widowed",
      linkedin: "LinkedIn URL",
      portfolio: "Portfolio URL",
      photo: "Profile Photo",
      summary: "Professional Summary",
      summaryPlaceholder: "Summarize your expertise and achievements",
      experience: "Work Experience",
      experienceAdd: "Add Position",
      company: "Company Name",
      location: "Location",
      startDate: "Start Date",
      endDate: "End Date",
      description: "Key responsibilities and achievements",
      education: "Education",
      educationAdd: "Add Education",
      institution: "Institution Name",
      degree: "Degree",
      field: "Field of Study",
      gpa: "GPA (optional)",
      skills: "Skills",
      skillsAdd: "Add Skill",
      skillName: "Skill Name",
      proficiency: "Proficiency",
      certifications: "Certifications",
      certificationsAdd: "Add Certification",
      certName: "Certification Name",
      issuer: "Issuing Organization",
      dateEarned: "Date Earned",
      languages: "Languages",
      languagesAdd: "Add Language",
      languageName: "Language",
      aiSuggest: "AI Suggest",
      // Added labels for custom section
      custom: "Custom Section",
      customAdd: "Add Custom Entry",
      customItemTitle: "Entry Title",
      customItemDescription: "Entry Description",
      customSections: "Custom Sections",
      addCustomSection: "Add Custom Section",
      customSectionType: "Type",
      title: "Title",
      date: "Date",
    },
  }), []);

  const t = labels[language] || labels.en;

  // Check if current template is a freshers template
  const isFreshersTemplate = selectedTemplate && (
    selectedTemplate === "freshers" ||
    selectedTemplate === "freshers_simple" ||
    selectedTemplate.startsWith("freshers")
  );

  // Form sections configuration
  const sectionsConfig = useMemo(() => {
    const baseSections = [
      {
        key: "personal",
        label: t.personalInfo,
        component: PersonalInfoSection,
        data: {
          name: data.name,
          jobTitle: data.jobTitle,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          maritalStatus: data.maritalStatus,
          linkedin: data.linkedin,
          portfolio: data.portfolio,
          photo: data.photo,
        },
        onChange: (updatedData) => onUpdate({ ...data, ...updatedData }),
      },
      {
        key: "summary",
        label: t.summary,
        component: SummarySection,
        data: data.summary ?? "",
        onChange: (value) => onUpdate({ ...data, summary: value }),
      }
    ];

    // Only add experience section if NOT a fresher template
    if (!isFreshersTemplate) {
      baseSections.push({
        key: "experience",
        label: t.experience,
        items: data.experience || [],
        sortable: true, // Enable sorting for experience
        currentSortOrder: sectionSortOrders['experience'] || 'newest',
        onSort: () => {
          // Toggle sort order
          const currentOrder = sectionSortOrders['experience'] || 'newest';
          const newOrder = currentOrder === 'newest' ? 'oldest' : 'newest';

          // Update sort order state
          setSectionSortOrders(prev => ({ ...prev, experience: newOrder }));

          const sorted = [...(data.experience || [])].sort((a, b) => {
            // Parse dates for comparison
            const getDateValue = (dateStr) => {
              if (!dateStr || dateStr.toLowerCase() === 'present') return new Date();
              const parsed = tryParseDate(dateStr);
              return parsed ? new Date(parsed) : new Date(0);
            };

            const dateA = getDateValue(a.startDate);
            const dateB = getDateValue(b.startDate);

            // Sort based on NEW order
            return newOrder === 'newest' ? dateB - dateA : dateA - dateB;
          });

          onUpdate({ ...data, experience: sorted });
          toast.success(`Experience sorted: ${newOrder === 'newest' ? 'Newest first' : 'Oldest first'}`);
        },
        onChange: (index, item) => {
          const updated = [...data.experience];
          updated[index] = item;
          onUpdate({ ...data, experience: updated });
        },
        onAdd: () => onUpdate({
          ...data,
          experience: [...data.experience, {
            jobTitle: "",
            company: "",
            location: "",
            startDate: DEFAULT_START_DATE, // Set default start date
            endDate: DEFAULT_END_DATE, // Set default end date
            description: ""
          }],
        }),
        onRemove: (index) => onUpdate({
          ...data,
          experience: data.experience.filter((_, i) => i !== index),
        }),
        fields: [
          { name: "jobTitle", label: t.jobTitle, type: "text" },
          { name: "company", label: t.company, type: "text" },
          { name: "location", label: t.location, type: "text" },
          { name: "startDate", label: t.startDate, type: "date" },
          { name: "endDate", label: t.endDate, type: "date" },
          { name: "description", label: t.description, type: "textarea", aiPowered: true },
        ],
      });
    }

    // Add remaining sections
    baseSections.push(
      {
        key: "education",
        label: t.education,
        items: data.education || [],
        onChange: (index, item) => {
          const updated = [...data.education];
          updated[index] = item;
          onUpdate({ ...data, education: updated });
        },
        onAdd: () => onUpdate({
          ...data,
          education: [...data.education, {
            institution: "",
            degree: "",
            field: "",
            startDate: DEFAULT_START_DATE, // Set default start date
            endDate: DEFAULT_END_DATE, // Set default end date
            gpa: ""
          }],
        }),
        onRemove: (index) => onUpdate({
          ...data,
          education: data.education.filter((_, i) => i !== index),
        }),
        fields: [
          { name: "institution", label: t.institution, type: "text" },
          { name: "degree", label: t.degree, type: "text" },
          { name: "field", label: t.field, type: "text" },
          { name: "startDate", label: t.startDate, type: "date" },
          { name: "endDate", label: t.endDate, type: "date" },
          ...(preferences?.education?.showGPA ? [{ name: "gpa", label: t.gpa, type: "text" }] : []),
        ],
      },
      {
        key: "skills",
        label: t.skills,
        items: (data.skills || []).map(normalizeSkill),
        onChange: (index, item) => {
          const currentSkills = data.skills || [];
          const updated = [...currentSkills];
          updated[index] = item;
          onUpdate({ ...data, skills: updated });
        },
        onAdd: () => {
          const scale = preferences?.skills?.proficiencyScale || "1-5";
          let defaultProf;
          if (scale === "percentage") defaultProf = 50;
          else if (scale === "beginner-expert") defaultProf = "Intermediate";
          else defaultProf = 3; // 1-5 scale
          const normalizedSkills = (data.skills || []).map(normalizeSkill);
          onUpdate({ ...data, skills: [...normalizedSkills, { name: "", proficiency: defaultProf }] });
        },
        onRemove: (index) => {
          const normalizedSkills = (data.skills || []).map(normalizeSkill);
          onUpdate({ ...data, skills: normalizedSkills.filter((_, i) => i !== index) });
        },
        fields: [
          { name: "name", label: t.skillName, type: "text" },
          ...(preferences?.skills?.showProficiency ? (() => {
            const scale = preferences?.skills?.proficiencyScale || "1-5";
            if (scale === "percentage") {
              return [{ name: "proficiency", label: "%", type: "number", min: 0, max: 100 }];
            } else if (scale === "beginner-expert") {
              return [{
                name: "proficiency", label: t.proficiency, type: "select", options: [
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                  { value: "Expert", label: "Expert" },
                ]
              }];
            } else { // Default to 1-5 scale
              return [{ name: "proficiency", label: t.proficiency + " (1-5)", type: "number", min: 1, max: 5 }];
            }
          })() : []),
        ],
      },
      {
        key: "certifications",
        label: t.certifications,
        items: data.certifications || [],
        onChange: (index, item) => {
          const updated = [...data.certifications];
          updated[index] = item;
          onUpdate({ ...data, certifications: updated });
        },
        onAdd: () => onUpdate({
          ...data,
          certifications: [...data.certifications, {
            name: "",
            issuer: "",
            date: DEFAULT_END_DATE // Set default date
          }],
        }),
        onRemove: (index) => onUpdate({
          ...data,
          certifications: data.certifications.filter((_, i) => i !== index),
        }),
        fields: [
          { name: "name", label: t.certName, type: "text" },
          { name: "issuer", label: t.issuer, type: "text" },
          { name: "date", label: t.dateEarned, type: "date" },
        ],
      },
      {
        key: "languages",
        label: t.languages,
        items: data.languages || [],
        onChange: (index, item) => {
          const updated = [...data.languages];
          updated[index] = item;
          onUpdate({ ...data, languages: updated });
        },
        onAdd: () => onUpdate({
          ...data,
          languages: [...data.languages, { language: "", proficiency: "Native" }],
        }),
        onRemove: (index) => onUpdate({
          ...data,
          languages: data.languages.filter((_, i) => i !== index),
        }),
        fields: [
          { name: "language", label: t.languageName, type: "text" },
          {
            name: "proficiency",
            label: t.proficiency,
            type: "select",
            options: [
              { value: "Basic", label: "Basic" },
              { value: "Conversational", label: "Conversational" },
              { value: "Professional", label: "Professional" },
              { value: "Native", label: "Native" },
            ],
          },
        ],
      },
      // Added Custom Section
      {
        key: "customSections",
        label: t.customSections,
        items: data.customSections || [],
        onChange: (index, item) => {
          const updated = [...(data.customSections || [])];
          updated[index] = item;
          onUpdate({ ...data, customSections: updated });
        },
        onAdd: () => onUpdate({
          ...data,
          customSections: [...(data.customSections || []), { type: "project", title: "", description: "", date: "" }],
        }),
        onRemove: (index) => onUpdate({
          ...data,
          customSections: (data.customSections || []).filter((_, i) => i !== index),
        }),
        fields: [
          {
            name: "type",
            label: t.customSectionType,
            type: "select",
            options: [
              { value: "project", label: "Project" },
              { value: "achievements", label: "Achievements" },
              { value: "internship", label: "Internship" },
              { value: "volunteer", label: "Volunteer Work" },
              { value: "publication", label: "Publication" },
              { value: "reference", label: "Reference" },
              { value: "award", label: "Award" },
              { value: "hobby", label: "Hobby" },
            ],
          },
          { name: "title", label: t.title, type: "text" },
          { name: "description", label: t.description, type: "textarea" },
          { name: "date", label: t.date, type: "month" },
          { name: "name", label: "Reference Name", type: "text", conditional: (item) => item.type === "reference" },
          { name: "email", label: "Reference Email", type: "email", conditional: (item) => item.type === "reference" },
          { name: "phone", label: "Reference Phone", type: "tel", conditional: (item) => item.type === "reference" },
          // Internship-specific fields
          { name: "company", label: "Company", type: "text", conditional: (item) => item.type === "internship" },
          { name: "position", label: "Position", type: "text", conditional: (item) => item.type === "internship" },
          { name: "location", label: "Location", type: "text", conditional: (item) => item.type === "internship" },
          { name: "achievements", label: "Key Achievements", type: "textarea", conditional: (item) => item.type === "internship" },
        ],
      }
    );

    return baseSections;
  }, [t, preferences, data, userId, onUpdate, generateAISuggestion, isLoadingAI, isFreshersTemplate]);

  const getSectionCompletionPercent = (sectionKey) => {
    // Calculate completion based on actual data fields rather than ATS scores
    switch (sectionKey) {
      case "personal":
        const personalFields = ["name", "email", "phone", "jobTitle"];
        const filledPersonalFields = personalFields.filter(field => {
          const value = data[field];
          if (!value) return false;
          // Handle both strings and arrays
          const stringValue = Array.isArray(value) ? value.join(' ') : String(value);
          return stringValue.trim().length > 0;
        });
        return (filledPersonalFields.length / personalFields.length) * 100;

      case "summary":
        if (!data.summary) return 0;
        const summaryValue = Array.isArray(data.summary) ? data.summary.join(' ') : String(data.summary);
        return summaryValue.trim().length > 50 ? 100 : 0;

      case "experience":
        if (!data.experience || data.experience.length === 0) return 0;
        const experienceFields = ["jobTitle", "company", "description"];
        const avgExperienceCompletion = data.experience.reduce((total, exp) => {
          const filledFields = experienceFields.filter(field => {
            const value = exp[field];
            if (!value) return false;
            // Handle both strings and arrays
            const stringValue = Array.isArray(value) ? value.join('\n') : String(value);
            return stringValue.trim().length > 0;
          });
          return total + (filledFields.length / experienceFields.length);
        }, 0);
        return (avgExperienceCompletion / data.experience.length) * 100;

      case "education":
        if (!data.education || data.education.length === 0) return 0;
        const educationFields = ["institution", "degree", "field"];
        const avgEducationCompletion = data.education.reduce((total, edu) => {
          const filledFields = educationFields.filter(field => {
            const value = edu[field];
            if (!value) return false;
            // Handle both strings and arrays
            const stringValue = Array.isArray(value) ? value.join(' ') : String(value);
            return stringValue.trim().length > 0;
          });
          return total + (filledFields.length / educationFields.length);
        }, 0);
        return (avgEducationCompletion / data.education.length) * 100;

      case "skills":
        if (!data.skills || data.skills.length === 0) return 0;
        const normalizedSkills = data.skills.map(normalizeSkill);
        const filledSkills = normalizedSkills.filter(skill => {
          if (!skill || !skill.name) return false;
          const stringValue = Array.isArray(skill.name) ? skill.name.join(' ') : String(skill.name);
          return stringValue.trim().length > 0;
        });
        return Math.min(100, (filledSkills.length / 5) * 100); // Consider 5+ skills as complete

      case "certifications":
        if (!data.certifications || data.certifications.length === 0) return 0;
        const filledCerts = data.certifications.filter(cert => {
          if (!cert) return false;
          const certName = cert.name;
          if (!certName) return false;
          const stringValue = Array.isArray(certName) ? certName.join(' ') : String(certName);
          return stringValue.trim().length > 0;
        });
        return Math.min(100, (filledCerts.length / 2) * 100); // Consider 2+ certs as complete

      case "languages":
        if (!data.languages || data.languages.length === 0) return 0;
        const filledLanguages = data.languages.filter(lang => {
          if (!lang) return false;
          const langName = lang.language;
          if (!langName) return false;
          const stringValue = Array.isArray(langName) ? langName.join(' ') : String(langName);
          return stringValue.trim().length > 0;
        });
        return Math.min(100, (filledLanguages.length / 2) * 100); // Consider 2+ languages as complete

      case "customSections":
        if (!data.customSections || data.customSections.length === 0) return 0;
        const filledCustomSections = data.customSections.filter(section => {
          if (!section) return false;
          const sectionTitle = section.title;
          if (!sectionTitle) return false;
          const stringValue = Array.isArray(sectionTitle) ? sectionTitle.join(' ') : String(sectionTitle);
          return stringValue.trim().length > 0;
        });
        return Math.min(100, (filledCustomSections.length / 1) * 100); // Consider 1+ custom section as complete

      default:
        return 0;
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  // Calculate overall form completion percentage
  const calculateOverallProgress = useCallback(() => {
    const sectionKeys = ['personal', 'summary', 'experience', 'education', 'skills'];
    const completions = sectionKeys.map(key => getSectionCompletionPercent(key));
    const avgCompletion = completions.reduce((sum, val) => sum + val, 0) / completions.length;
    return Math.round(avgCompletion);
  }, [data]);

  const overallProgress = useMemo(() => calculateOverallProgress(), [calculateOverallProgress]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ATS Score Header */}

      {/* ATS Tips Banner - Only show if there are tips to display */}
      {sectionScores.completeness && (() => {
        const lowScoringSections = Object.entries(sectionScores).filter(([key, section]) =>
          section.score < section.max * 0.8
        );

        return lowScoringSections.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-[#0B1F3B] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#0B1F3B] mb-2">ATS Optimization Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#0B1F3B]">
                  {lowScoringSections.map(([key, section]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full" />
                      <span>{section.feedback}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null;
      })()}

      <div className="space-y-6">
        {sectionsConfig.map((section) => {
          const completionPercent = getSectionCompletionPercent(section.key);

          return (
            <motion.div
              const key={section.key}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <SectionHeader
                title={section.label}
                sectionKey={section.key}
                completionPercent={completionPercent}
                tips={sectionScores[section.key]?.feedback}
                sortable={section.sortable}
                onSort={section.onSort}
                itemsCount={section.items?.length || 0}
                currentSortOrder={section.currentSortOrder}
              />

              <AnimatePresence>
                {!collapsedSections[section.key] && (
                  <motion.div
                    initial={false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {section.component ? (
                        section.key === "summary" ? (
                          <section.component
                            value={section.data}
                            onChange={section.onChange}
                            t={t}
                            generateAISuggestion={generateAISuggestion}
                            isLoadingAI={isLoadingAI}
                            currentUserId={currentUserId}
                            currentResumeId={currentResumeId}
                            isPremium={isPremium}
                            isBasicPlan={isBasicPlan}
                            isOneDayPlan={isOneDayPlan}
                            aiRephraseUses={aiRephraseUses}
                            aiBulletsUses={anonymousBulletUses}
                            onAIRephraseUse={handleAIRephraseUse}
                            onAIBulletsUse={handleAIBulletsUse}
                          />
                        ) : (
                          <section.component
                            data={section.data}
                            onChange={section.onChange}
                            userId={userId}
                            t={t}
                            generateAISuggestion={generateAISuggestion}
                            isLoadingAI={isLoadingAI}
                            currentUserId={currentUserId}
                            currentResumeId={currentResumeId}
                            onUpdate={onUpdate}
                            rawData={rawData}
                          />
                        )
                      ) : (
                        <ArraySection
                          section={section.key}
                          items={section.items}
                          onChange={section.onChange}
                          onAdd={section.onAdd}
                          onRemove={section.onRemove}
                          fields={section.fields}
                          t={t}
                          generateAISuggestion={generateAISuggestion}
                          isLoadingAI={isLoadingAI}
                          userId={userId}
                          anonymousBulletUses={anonymousBulletUses}
                          setAnonymousBulletUses={setAnonymousBulletUses}
                          isPremium={isPremium}
                          currentUserId={currentUserId}
                          currentResumeId={currentResumeId}
                          isBasicPlan={isBasicPlan}
                          isOneDayPlan={isOneDayPlan}
                          aiRephraseUses={aiRephraseUses}
                          onAIRephraseUse={handleAIRephraseUse}
                          onAIBulletsUse={handleAIBulletsUse}
                          sortable={section.sortable}
                          onSort={section.onSort}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}