"use client";
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import {
  FileText,
  Upload,
  Wand2,
  Download,
  Eye,
  Palette,
  Save,
  Bot,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Briefcase,
  User,
  Target,
  Crown,
  RefreshCw,
  HelpCircle,
  X,
  Edit,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Lock,
  ChevronDown,
  FileCheck,
  History,
  List,
  ExternalLink,
  Clock,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import TemplateSelector from "./TemplateSelector";
import ColorCustomizer from "./ColorCustomizer";
import ProgressOverlay from "./ProgressOverlay";
import PremiumPdfPreview from "./PremiumPdfPreview";
import InterviewCheatsheetCTA from "./InterviewCheatsheetCTA";
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

import HelpModal from "./HelpModal";
import ChromeExtensionPromoModal from "./ChromeExtensionPromoModal";

import { templates } from "../lib/templates";
import { defaultConfig } from "../lib/templates";
import { atsFriendlyTemplates } from "../lib/atsFriendlyTemplates.js";
import { visualAppealTemplates } from "../lib/visualAppealTemplates.js";
import { premiumDesignTemplates } from "../lib/premiumDesignTemplates.js";
import { saveResumeDataWithIndiaHandling } from "../lib/storage";
import { cleanResumeDataForFirebase } from "../lib/utils";
import { useProfileGuard } from "../hooks/useProfileGuard"; // [NEW]
import { event } from "../lib/gtag";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";
import { hasFeatureAccess } from "../lib/planFeatures";
import { logActivity, ACTIVITY_TYPES, getAdminId } from "../lib/teamManagement";
import { checkQuota, incrementQuota, QUOTA_TYPES } from "../lib/enterpriseQuotas";
import QuotaLimitModal from "./QuotaLimitModal";
import { saveJDResumeHistory } from "../lib/uploadHistory";

// Editable Resume Preview Component
function EditableResumePreview({
  data,
  onUpdate,
  editingSection,
  setEditingSection,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  updateTempData,
  renderDescriptionText,
  isEditMode
}) {
  const [newSkill, setNewSkill] = useState("");

  if (!data) return null;

  const handleSectionClick = (section, e) => {
    // Don't toggle if clicking on input elements or buttons
    const isInteractiveElement = ['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName);
    if (!isInteractiveElement) {
      setEditingSection(editingSection === section ? null : section);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill);
      setNewSkill("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 shadow-xl rounded-xl border border-gray-100">
      {/* Enhanced Edit Mode Instructions - Mobile */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#0B1F3B]/5 border-2 border-[#00C4B3]/20 rounded-lg">
        <p className="text-xs sm:text-sm text-[#0F172A] font-medium mb-2">
          📝 Tap any section below to edit it
        </p>
        <ul className="text-xs text-[#0B1F3B] space-y-1">
          <li>• Tap sections to edit content</li>
          <li>• Use ✖ to remove items</li>
          <li>• Use + to add new items</li>
        </ul>
      </div>

      {/* Personal Information - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 relative touch-manipulation ${editingSection === 'personal'
          ? 'bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 border-2 border-[#00C4B3] shadow-xl ring-4 ring-[#00C4B3]/10'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#00C4B3]/5 border-2 border-transparent hover:border-[#00C4B3]/20 hover:shadow-lg'
          }`}
        onClick={(e) => handleSectionClick('personal', e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSectionClick('personal', e);
          }
        }}
        role="button"
        tabIndex="0"
        aria-label="Click to edit personal information"
        aria-expanded={editingSection === 'personal'}
      >
        {editingSection === 'personal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium"
          >
            ✨ Editing
          </motion.div>
        )}
        <div className="text-center">
          {editingSection === 'personal' && (
            <div className="mb-2 text-sm text-[#0B1F3B] font-medium">
              Editing Personal Information
            </div>
          )}
          {editingSection === 'personal' ? (
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                type="text"
                value={data.name || ''}
                onChange={(e) => updateTempData('name', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-xl sm:text-2xl font-bold text-center w-full border-b-2 border-[#00C4B3] bg-transparent focus:outline-none focus:border-[#00C4B3] transition-colors duration-200 py-2 touch-manipulation"
                placeholder="Your Name"
                aria-label="Your full name"
              />
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="text"
                value={data.jobTitle || ''}
                onChange={(e) => updateTempData('jobTitle', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-base sm:text-lg text-gray-600 text-center w-full border-b-2 border-[#00C4B3] bg-transparent focus:outline-none focus:border-[#00C4B3] transition-colors duration-200 py-2 touch-manipulation"
                placeholder="Job Title"
                aria-label="Your job title"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm mt-3">
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => updateTempData('email', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="border-b-2 border-[#00C4B3]/30 bg-transparent focus:outline-none focus:border-[#00C4B3] py-2 px-1 transition-colors touch-manipulation"
                  placeholder="Email"
                  aria-label="Email address"
                />
                <input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => updateTempData('phone', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="border-b-2 border-[#00C4B3]/30 bg-transparent focus:outline-none focus:border-[#00C4B3] py-2 px-1 transition-colors touch-manipulation"
                  placeholder="Phone"
                  aria-label="Phone number"
                />
                <input
                  type="text"
                  value={data.address || ''}
                  onChange={(e) => updateTempData('address', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="border-b-2 border-[#00C4B3]/30 bg-transparent focus:outline-none focus:border-[#00C4B3] py-2 px-1 transition-colors touch-manipulation"
                  placeholder="Address"
                  aria-label="Address"
                />
                <input
                  type="url"
                  value={data.linkedin || ''}
                  onChange={(e) => updateTempData('linkedin', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="border-b-2 border-[#00C4B3]/30 bg-transparent focus:outline-none focus:border-[#00C4B3] py-2 px-1 transition-colors touch-manipulation"
                  placeholder="LinkedIn"
                  aria-label="LinkedIn profile"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{data.name || 'Your Name'}</h1>
              <p className="text-lg text-gray-600">{data.jobTitle || 'Job Title'}</p>
              <div className="text-sm text-gray-500 mt-2">
                {[data.email, data.phone, data.address].filter(Boolean).join(' | ')}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                (click here to edit personal info)
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Professional Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 relative touch-manipulation ${editingSection === 'summary'
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-xl ring-4 ring-green-100'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 border-2 border-transparent hover:border-green-200 hover:shadow-lg'
          }`}
        onClick={(e) => handleSectionClick('summary', e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSectionClick('summary', e);
          }
        }}
        role="button"
        tabIndex="0"
        aria-label="Click to edit professional summary"
        aria-expanded={editingSection === 'summary'}
      >
        {editingSection === 'summary' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium"
          >
            ✨ Editing
          </motion.div>
        )}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          Professional Summary
          {editingSection !== 'summary' && (
            <span className="text-xs text-gray-500">(click to edit)</span>
          )}
        </h2>
        {editingSection === 'summary' ? (
          <div onClick={(e) => e.stopPropagation()}>
            <textarea
              value={data.summary || ''}
              onChange={(e) => updateTempData('summary', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-32 sm:h-24 p-3 sm:p-4 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 resize-none text-sm sm:text-base bg-white transition-all touch-manipulation"
              placeholder="Write your professional summary..."
              aria-label="Professional summary text"
            />
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed">{data.summary || 'Professional summary will appear here...'}</p>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 relative touch-manipulation ${editingSection === 'skills'
          ? 'bg-gradient-to-r from-[#00C4B3]/5 to-[#0B1F3B]/5 border-2 border-[#00C4B3] shadow-xl ring-4 ring-[#00C4B3]/10'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#00C4B3]/5 border-2 border-transparent hover:border-[#00C4B3]/20 hover:shadow-lg'
          }`}
        onClick={(e) => handleSectionClick('skills', e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSectionClick('skills', e);
          }
        }}
        role="button"
        tabIndex="0"
        aria-label="Click to edit skills"
        aria-expanded={editingSection === 'skills'}
      >
        {editingSection === 'skills' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium"
          >
            ✨ Editing
          </motion.div>
        )}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          Skills
          {editingSection !== 'skills' && (
            <span className="text-xs text-gray-500">(click to edit)</span>
          )}
        </h2>
        {editingSection === 'skills' ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill, index) => {
                const skillText = typeof skill === 'string' ? skill : skill?.name || skill?.skill || String(skill);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 bg-gradient-to-r from-[#00C4B3]/10 to-[#0B1F3B]/10 text-[#0F172A] px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-medium">{skillText}</span>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(index);
                      }}
                      className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={14} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 border-2 border-[#00C4B3] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-[#00C4B3]/20 focus:border-[#00C4B3] text-sm sm:text-base transition-all touch-manipulation"
                placeholder="Add new skill..."
                aria-label="New skill name"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSkill();
                }}
                className="bg-[#0B1F3B] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-[#0B1F3B]/90 active:bg-[#0B1F3B] flex items-center gap-1.5 font-semibold text-sm sm:text-base min-h-[44px] shadow-md transition-all touch-manipulation"
                aria-label="Add skill"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills?.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : skill?.name || skill?.skill || String(skill);
              return (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {skillText}
                </span>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Experience */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl cursor-pointer transition-all duration-300 relative touch-manipulation ${editingSection === 'experience'
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-400 shadow-xl ring-4 ring-orange-100'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 border-2 border-transparent hover:border-orange-200 hover:shadow-lg'
          }`}
        onClick={(e) => handleSectionClick('experience', e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSectionClick('experience', e);
          }
        }}
        role="button"
        tabIndex="0"
        aria-label="Click to edit experience"
        aria-expanded={editingSection === 'experience'}
      >
        {editingSection === 'experience' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium"
          >
            ✨ Editing
          </motion.div>
        )}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Experience
            {editingSection !== 'experience' && (
              <span className="text-xs text-gray-500">(click to edit)</span>
            )}
          </h2>
          {editingSection === 'experience' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addExperience();
              }}
              className="bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 font-semibold hover:bg-green-700 active:bg-green-800 min-h-[40px] shadow-md transition-all touch-manipulation"
              aria-label="Add new experience"
            >
              <Plus size={16} />
              <span>Add Experience</span>
            </button>
          )}
        </div>
        {editingSection === 'experience' ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            {data.experience?.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="border-2 border-orange-200 rounded-lg p-4 relative bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(index);
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation z-10"
                  aria-label="Remove experience"
                >
                  <Trash2 size={18} />
                </motion.button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                  <input
                    type="text"
                    value={exp.jobTitle || ''}
                    onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-2 border-orange-300 rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-600 text-sm sm:text-base transition-all touch-manipulation"
                    placeholder="Job Title"
                    aria-label="Job title"
                  />
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-2 border-orange-300 rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-600 text-sm sm:text-base transition-all touch-manipulation"
                    placeholder="Company"
                    aria-label="Company name"
                  />
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-2 border-orange-300 rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-600 text-sm sm:text-base transition-all touch-manipulation"
                    placeholder="Start Date (e.g., Jan 2020)"
                    aria-label="Start date"
                  />
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-2 border-orange-300 rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-600 text-sm sm:text-base transition-all touch-manipulation"
                    placeholder="End Date (or Present)"
                    aria-label="End date"
                  />
                </div>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-24 sm:h-20 border-2 border-orange-300 rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-600 resize-none text-sm sm:text-base transition-all touch-manipulation"
                  placeholder="Job description and achievements..."
                  aria-label="Job description"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data.experience?.map((exp, index) => (
              <div key={index} className="border-l-4 border-[#00C4B3] pl-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-800">{exp.jobTitle}</h3>
                  <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{exp.company}</p>
                {renderDescriptionText(exp.description)}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`mb-6 p-6 rounded-xl cursor-pointer transition-all duration-300 relative ${editingSection === 'education'
          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-xl shadow-teal-100'
          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-teal-50 border-2 border-transparent hover:border-teal-200 hover:shadow-lg'
          }`}
        onClick={(e) => handleSectionClick('education', e)}
      >
        {editingSection === 'education' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-3 -right-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium"
          >
            ✨ Editing
          </motion.div>
        )}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          Education
          {editingSection !== 'education' && (
            <span className="text-xs text-gray-500">(click to edit)</span>
          )}
        </h2>
        {editingSection === 'education' ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            {data.education?.map((edu, index) => (
              <div key={index} className="border-2 border-[#00C4B3]/20 rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index] = { ...newEdu[index], degree: e.target.value };
                      updateTempData('education', newEdu);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border border-[#00C4B3]/30 rounded px-3 py-2 focus:outline-none"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index] = { ...newEdu[index], institution: e.target.value };
                      updateTempData('education', newEdu);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border border-[#00C4B3]/30 rounded px-3 py-2 focus:outline-none"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.startDate || ''}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index] = { ...newEdu[index], startDate: e.target.value };
                      updateTempData('education', newEdu);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border border-[#00C4B3]/30 rounded px-3 py-2 focus:outline-none"
                    placeholder="Start Date"
                  />
                  <input
                    type="text"
                    value={edu.endDate || ''}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index] = { ...newEdu[index], endDate: e.target.value };
                      updateTempData('education', newEdu);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border border-[#00C4B3]/30 rounded px-3 py-2 focus:outline-none"
                    placeholder="End Date"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.education?.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function JobDescriptionResumeBuilder({
  enterpriseMode = false,
  selectedClient = null,
  enterpriseUserId = null,
  loadedHistoryData = null,
  quickAccessMode = false
}) {
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedResume, setUploadedResume] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [enhancedResumeData, setEnhancedResumeData] = useState(null);
  const [enhancementSummary, setEnhancementSummary] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [customColors, setCustomColors] = useState({});



  // Usage tracking state
  const [jobDescriptionEnhancements, setJobDescriptionEnhancements] = useState(0);
  const [basicPlanExpiry, setBasicPlanExpiry] = useState(null);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingToAccount, setIsSavingToAccount] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showColorCustomizer, setShowColorCustomizer] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPremiumPdfModal, setShowPremiumPdfModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewBlob, setPdfPreviewBlob] = useState(null);
  const [loginAndSubscribeModalOpen, setLoginAndSubscribeModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Helper function for consistent upgrade flow
  const handleConsistentUpgradeClick = (billingCycle = 'quarterly', source = 'job-description-builder') => {
    // If in enterprise mode, redirect to enterprise checkout
    if (enterpriseMode) {
      router.push('/enterprise/checkout');
      return;
    }

    if (user) {
      router.push(`/checkout?billingCycle=${billingCycle}&currency=${currency}`);
    } else {
      // Store checkout intent and message in storage
      localStorage.setItem('checkoutIntent', JSON.stringify({ billingCycle, source }));
      sessionStorage.setItem('loginMessage', 'Please login to continue with your purchase');
      window.location.href = `/login`;
    }
  };


  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [tempResumeData, setTempResumeData] = useState(null);

  // Keyword analysis state
  const [detectedKeywords, setDetectedKeywords] = useState([]);

  // Job-Resume matching state
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [showMatchWarning, setShowMatchWarning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check for extension data on mount
  useEffect(() => {
    const storedContext = localStorage.getItem('extension_job_context');
    if (storedContext) {
      try {
        const data = JSON.parse(storedContext);
        if (data.description) {
          setJobDescription(data.description);
          toast.success("Job description loaded from LinkedIn extension!");
          // Clean up to prevent reloading it on refresh if not desired
          localStorage.removeItem('extension_job_context');
        }
      } catch (e) {
        console.error("Failed to parse extension context", e);
      }
    }
  }, []);

  // Progress tracking
  const [progress, setProgress] = useState({
    jobDescription: false,
    resumeUpload: false,
    enhancement: false,
    complete: false
  });

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeNameInput, setResumeNameInput] = useState("");
  const [saveDialogError, setSaveDialogError] = useState("");

  // Resume name for PDF downloads
  const [currentResumeName, setCurrentResumeName] = useState("Resume");

  // JD Management & Resume Switcher states
  const [jdCreatedResumes, setJdCreatedResumes] = useState([]);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [showResumeSwitcher, setShowResumeSwitcher] = useState(false);
  const [showJDHistory, setShowJDHistory] = useState(false);
  const [isLoadingSwitcher, setIsLoadingSwitcher] = useState(false);

  const { user, plan, isPremium } = useAuth();
  const { currency } = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  // State for plan access and billing cycle
  const [hasAccess, setHasAccess] = useState(false);
  const [billingCycle, setBillingCycle] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Client-side only state to prevent hydration mismatch
  const [showAuthContent, setShowAuthContent] = useState(false);

  // Quota state for enterprise users
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Show auth content after mount to prevent hydration mismatch
  useEffect(() => {
    setShowAuthContent(true);
  }, []);

  // Profile Guard
  const { checkProfileAccess, ProfileGuardModal, setIsProfileLimitModalOpen } = useProfileGuard(); // [NEW]

  // Quick access: Load history data if provided
  useEffect(() => {
    if (!loadedHistoryData || !quickAccessMode) return;

    console.log('🚀 Quick access: Loading JD history data into builder', loadedHistoryData);

    try {
      // Restore the job description
      if (loadedHistoryData.jobDescription) {
        setJobDescription(loadedHistoryData.jobDescription);
        setProgress(prev => ({ ...prev, jobDescription: true }));
      }

      // Restore the parsed resume data
      if (loadedHistoryData.parsedResumeData) {
        setParsedResumeData(loadedHistoryData.parsedResumeData);
        setProgress(prev => ({ ...prev, resumeUpload: true }));
      }

      // Restore the enhanced resume data
      if (loadedHistoryData.enhancedResumeData) {
        setEnhancedResumeData(loadedHistoryData.enhancedResumeData);
        setProgress(prev => ({ ...prev, enhancement: true, complete: true }));
      }

      // Restore the enhancement summary
      if (loadedHistoryData.enhancementSummary) {
        setEnhancementSummary(loadedHistoryData.enhancementSummary);
      }

      // Restore template and colors
      if (loadedHistoryData.selectedTemplate) {
        setSelectedTemplate(loadedHistoryData.selectedTemplate);
      }
      if (loadedHistoryData.customColors) {
        setCustomColors(loadedHistoryData.customColors);
      }

      // Move to the final step if enhancement is complete
      if (loadedHistoryData.enhancedResumeData) {
        setCurrentStep(3);
        toast.success('JD resume loaded successfully!', { duration: 3000 });
      } else if (loadedHistoryData.parsedResumeData) {
        setCurrentStep(2);
        toast.success('Resume data loaded successfully!', { duration: 3000 });
      }

      console.log('✅ Quick access: JD history data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load history data:', error);
      toast.error('Failed to load JD resume data');
    }
  }, [loadedHistoryData, quickAccessMode]);

  // Check if user has access to JD Builder - simple premium check
  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    // If user has premium plan, give them access - no upgrade UI
    setHasAccess(isPremium);
  }, [user, isPremium]);

  // Load resume if resumeId is provided in URL
  useEffect(() => {
    const loadResumeData = async () => {
      if (!resumeId || !user) return;

      try {
        console.log("Loading resume from JD builder with ID:", resumeId);
        const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
          const resumeData = resumeSnap.data();
          console.log("Loaded resume data:", resumeData);

          // Set the enhanced resume data and related states
          setEnhancedResumeData(resumeData.resumeData);
          setSelectedTemplate(resumeData.template || 'classic');
          setCustomColors(resumeData.customColors || {});

          // Set the resume name for downloads
          if (resumeData.resumeName) {
            setCurrentResumeName(resumeData.resumeName);
          }

          // If there's a job description stored, load it
          if (resumeData.jobDescription) {
            setJobDescription(resumeData.jobDescription);
          }

          // If there's enhancement summary, load it
          if (resumeData.enhancementSummary) {
            setEnhancementSummary(resumeData.enhancementSummary);
          }

          // Set progress to show we're at the final step
          setProgress({
            jobDescription: true,
            resumeUpload: true,
            enhancement: true,
            complete: true
          });

          // Set current step to 3 (final view)
          setCurrentStep(3);

        } else {
          toast.error('Resume not found');
          console.error("Resume not found with ID:", resumeId);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
        toast.error('Failed to load resume');
      }
    };

    loadResumeData();
  }, [resumeId, user]);

  // Handle URL parameters for "Tailor CV" flow
  // Extracts job description and loads source resume if provided
  useEffect(() => {
    const jobDescParam = searchParams.get('jobDescription');
    const jobTitleParam = searchParams.get('jobTitle');
    const companyParam = searchParams.get('company');
    const sourceResumeId = searchParams.get('sourceResumeId');

    if (jobDescParam || (jobTitleParam && companyParam)) {
      console.log("Tailoring flow detected: setting job description");
      let fullDescription = jobDescParam || "";
      if (!fullDescription && jobTitleParam && companyParam) {
        fullDescription = `Role: ${jobTitleParam}\nCompany: ${companyParam}`;
      }
      setJobDescription(fullDescription);
      setProgress(prev => ({ ...prev, jobDescription: true }));
    }

    const loadSourceResume = async () => {
      if (!sourceResumeId || !user) return;

      try {
        console.log("Loading source resume for tailoring:", sourceResumeId);
        const resumeRef = doc(db, "users", user.uid, "resumes", sourceResumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
          const data = resumeSnap.data();
          // We use the resumeData as 'parsedResumeData' effectively bypassing the upload step
          if (data.resumeData) {
            setParsedResumeData(data.resumeData);
            setProgress(prev => ({ ...prev, resumeUpload: true }));

            // Allow user to review JD and Resume in Step 1/2
            toast.success("Resume loaded! Review the Job Description to continue.");
          }
        }
      } catch (e) {
        console.error("Error loading source resume:", e);
      }
    };

    if (sourceResumeId) {
      loadSourceResume();
    }
  }, [searchParams, user]);


  // Get pricing for the modal
  const pricing = getEffectivePricing(currency, false);

  // Format price function
  const formatPrice = (price, currency) => {
    const symbols = { USD: "$", INR: "₹" };
    if (currency === "USD") {
      return `${symbols[currency]}${(price / 100).toFixed(2)}`;
    }
    return `${symbols[currency]}${Math.floor(price / 100).toLocaleString("en-IN")}`;
  };

  // Close modals on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showTemplateSelector) setShowTemplateSelector(false);
        if (showColorCustomizer) setShowColorCustomizer(false);
        if (showPdfModal) setShowPdfModal(false);
        if (showPremiumPdfModal) setShowPremiumPdfModal(false);
        if (showHelpModal) setShowHelpModal(false);


      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTemplateSelector, showColorCustomizer, showPdfModal, showPremiumPdfModal, showHelpModal, loginAndSubscribeModalOpen]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showTemplateSelector || showColorCustomizer || showPdfModal || showPremiumPdfModal || showHelpModal || loginAndSubscribeModalOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showTemplateSelector, showColorCustomizer, showPdfModal, showPremiumPdfModal, showHelpModal, loginAndSubscribeModalOpen]);

  // Fetch user data and usage counts
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setJobDescriptionEnhancements(data.jobDescriptionEnhancements || 0);
            setBasicPlanExpiry(data.basic_plan_expiry || null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Smooth scroll to Step 1 when component mounts
  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => {
        const step1Content = document.getElementById('step-1-content');
        if (step1Content) {
          step1Content.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [currentStep]);

  // Load all JD-created resumes for resume switcher
  useEffect(() => {
    const loadJDCreatedResumes = async () => {
      if (!user) {
        setJdCreatedResumes([]);
        return;
      }

      try {
        console.log("🔍 Loading JD-created resumes for user:", user.uid);
        const resumesRef = collection(db, "users", user.uid, "resumes");

        // Try with orderBy first (requires Firestore index)
        let snapshot;
        try {
          const q = query(
            resumesRef,
            where("source", "==", "job_description_builder"),
            orderBy("updatedAt", "desc")
          );
          snapshot = await getDocs(q);
          console.log("✅ Query with orderBy successful");
        } catch (indexError) {
          // If index doesn't exist, fetch without orderBy and sort client-side
          console.log("⚠️ Firestore index not found, using client-side sorting");
          const q = query(
            resumesRef,
            where("source", "==", "job_description_builder")
          );
          snapshot = await getDocs(q);
        }

        let resumes = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📄 Resume found: ${data.resumeName || 'Untitled'} (source: ${data.source})`);
          return {
            id: doc.id,
            ...data,
            resumeName: data.resumeName || "Untitled Resume",
            jobDescriptionPreview: data.jobDescription ?
              data.jobDescription.substring(0, 100) + "..." :
              (data.jobDescriptionPreview || "No JD saved"),
            updatedAt: data.updatedAt || new Date().toISOString()
          };
        });

        // Sort client-side if we couldn't use orderBy
        resumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setJdCreatedResumes(resumes);
        console.log(`✅ Loaded ${resumes.length} JD-created resumes:`, resumes.map(r => `${r.resumeName} (${r.id})`));

        if (resumes.length === 0) {
          console.log("ℹ️ No JD-created resumes found. Make sure resumes are saved with source='job_description_builder'");
        }
      } catch (error) {
        console.error("❌ Error loading JD-created resumes:", error);
        console.error("Error details:", error.message);

        // Fallback: load ALL resumes and filter client-side
        try {
          console.log("🔄 Attempting fallback: loading all resumes...");
          const resumesRef = collection(db, "users", user.uid, "resumes");
          const allSnapshot = await getDocs(resumesRef);

          const allResumes = allSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          console.log(`📊 Total resumes found: ${allResumes.length}`);
          console.log("Resume sources:", allResumes.map(r => `${r.resumeName}: ${r.source}`));

          const jdResumes = allResumes
            .filter(r => r.source === "job_description_builder")
            .map(data => ({
              ...data,
              resumeName: data.resumeName || "Untitled Resume",
              jobDescriptionPreview: data.jobDescription ?
                data.jobDescription.substring(0, 100) + "..." :
                (data.jobDescriptionPreview || "No JD saved"),
              updatedAt: data.updatedAt || new Date().toISOString()
            }))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          setJdCreatedResumes(jdResumes);
          console.log(`✅ Fallback successful: ${jdResumes.length} JD resumes found`);
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          toast.error("Failed to load saved resumes");
        }
      }
    };

    loadJDCreatedResumes();
  }, [user]);

  // Load resume data if resumeId is provided in URL
  useEffect(() => {
    const resumeId = searchParams.get("resumeId");

    if (!resumeId || !user) return;

    const loadResumeFromFirestore = async () => {
      try {
        console.log("Loading resume from Firestore:", resumeId);
        const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
        const resumeDoc = await getDoc(resumeRef);

        if (resumeDoc.exists()) {
          const resumeData = resumeDoc.data();
          console.log("Resume data loaded:", resumeData);

          // Set all the resume data
          setEnhancedResumeData(resumeData.resumeData);
          setTempResumeData(resumeData.resumeData);
          setSelectedTemplate(resumeData.template || "classic");
          setCustomColors(resumeData.customColors || {});
          setJobDescription(resumeData.jobDescription || "");
          setEnhancementSummary(resumeData.enhancementSummary || null);
          setCurrentResumeName(resumeData.resumeName || "Resume");
          setCurrentResumeId(resumeId);

          // Move to step 3 (preview/edit)
          setCurrentStep(3);

          toast.success("Resume loaded successfully!");
        } else {
          console.error("Resume not found");
          toast.error("Resume not found");
        }
      } catch (error) {
        console.error("Error loading resume:", error);
        toast.error("Failed to load resume");
      }
    };

    loadResumeFromFirestore();
  }, [searchParams, user]);

  // Helper function to render description bullets
  const renderDescriptionText = (description) => {
    if (!description) return null;

    // Handle both string and array descriptions
    let lines;
    if (Array.isArray(description)) {
      // If it's already an array, use it directly after trimming
      lines = description.map(l => String(l).trim()).filter(Boolean);
    } else {
      // If it's a string, split into lines, trim, and filter empty
      lines = String(description).split('\n').map(l => l.trim()).filter(Boolean);
    }
    const bulletLines = lines.filter(l => /^[-•*]/.test(l));

    if (bulletLines.length >= Math.max(1, lines.length / 2)) {
      return (
        <ul className="list-disc ml-4 space-y-1 text-gray-700 text-sm leading-relaxed">
          {lines.map((line, idx) => (
            <li key={idx}>{line.replace(/^[-•*]\s*/, "")}</li>
          ))}
        </ul>
      );
    }

    // Otherwise render as regular text
    return <p className="text-gray-700 text-sm leading-relaxed">{description}</p>;
  };

  // Check if basic plan user has reached enhancement limit
  const checkBasicPlanEnhancementLimit = () => {
    // Enterprise users bypass enhancement limits
    if (enterpriseMode) return false;

    if (!user || isPremium) return false;

    // Check if basic plan has expired
    if (basicPlanExpiry && new Date() >= new Date(basicPlanExpiry)) {
      return true; // Plan expired, needs renewal
    }

    // Check if user has exceeded 1 enhancement total
    if (jobDescriptionEnhancements >= 1) {
      return true; // Enhancement limit reached
    }

    return false;
  };

  // Helper function to highlight critical gaps and concerns in text
  const highlightCriticalText = (text, isWarning = false) => {
    if (!text) return null;

    // Define patterns for highlighting critical gaps and concerns
    const criticalPatterns = [
      // Negative indicators
      /\b(lacks?|missing|absence|no evidence|not explicitly|insufficient|limited)\b/gi,
      /\b(weak|poor|inadequate|deficient|incomplete|partial)\b/gi,
      /\b(fails? to|doesn't|does not|cannot|unable to|struggles? with)\b/gi,
      /\b(concerns?|worries?|risks?|challenges?|difficulties?|obstacles?)\b/gi,
      /\b(gaps?|shortcomings?|deficiencies?|weaknesses?|limitations?)\b/gi,
      /\b(requires?|needs?|should|must|essential|critical|important)\b/gi,
      /\b(however|but|although|despite|while|whereas)\b/gi,
      /\b(careful|caution|warning|attention|consideration)\b/gi,
      /\b(adapt|adjust|change|modify|improve|enhance)\b/gi,
      /\b(cultural fit|environment|culture|team|collaboration)\b/gi,
      // Specific phrases that indicate gaps
      /\b(not enough|too little|minimal|basic|entry-level)\b/gi,
      /\b(needs improvement|room for growth|development required)\b/gi,
      /\b(experience gap|skill gap|knowledge gap)\b/gi,
      /\b(may not be|might not|could be|potential issues?)\b/gi,
      /\b(assessment needed|evaluation required|further review)\b/gi
    ];

    // Split text into parts and highlight critical sections
    let parts = [text];

    criticalPatterns.forEach(pattern => {
      const newParts = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const matches = part.match(pattern);
          if (matches) {
            let lastIndex = 0;
            let result = [];

            matches.forEach(match => {
              const index = part.indexOf(match, lastIndex);
              if (index > lastIndex) {
                result.push(part.substring(lastIndex, index));
              }
              result.push(
                <span
                  key={`highlight-${index}`}
                  className={`font-semibold ${isWarning ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} px-1 rounded`}
                >
                  {match}
                </span>
              );
              lastIndex = index + match.length;
            });

            if (lastIndex < part.length) {
              result.push(part.substring(lastIndex));
            }

            newParts.push(...result);
          } else {
            newParts.push(part);
          }
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <span>{parts}</span>;
  };

  // Function to open save dialog with suggested name
  const openSaveDialog = () => {
    // Auth Check
    if (!user) {
      toast.error("Please sign in to save your resume");
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If authenticated, proceed with the original logic
    // Generate suggested name from job description
    const jobTitle = jobDescription.split('\n')[0].substring(0, 50).trim();
    const suggestedName = jobTitle ? `${jobTitle} - Resume` : `Job-Specific Resume`;

    if (currentResumeName && currentResumeName !== "Resume") {
      setResumeNameInput(currentResumeName);
    } else {
      setResumeNameInput(suggestedName);
    }
    setSaveDialogError("");
    setShowSaveDialog(true);
  };

  // Function to switch to a different resume
  const switchToResume = async (resumeId) => {
    if (isLoadingSwitcher) return;

    setIsLoadingSwitcher(true);
    setShowResumeSwitcher(false);

    try {
      console.log("Switching to resume:", resumeId);

      // Update URL without reload
      router.push(`/job-description-resume-builder?resumeId=${resumeId}`);

      // Load the resume data
      const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
      const resumeDoc = await getDoc(resumeRef);

      if (resumeDoc.exists()) {
        const resumeData = resumeDoc.data();

        // Set all the resume data
        setEnhancedResumeData(resumeData.resumeData);
        setTempResumeData(resumeData.resumeData);
        setSelectedTemplate(resumeData.template || "classic");
        setCustomColors(resumeData.customColors || {});
        setJobDescription(resumeData.jobDescription || "");
        setEnhancementSummary(resumeData.enhancementSummary || null);
        setCurrentResumeName(resumeData.resumeName || "Resume");
        setCurrentResumeId(resumeId);

        // Move to step 3 (preview/edit)
        setCurrentStep(3);
        setIsEditMode(false);

        toast.success(`Switched to: ${resumeData.resumeName}`);
      } else {
        toast.error("Resume not found");
      }
    } catch (error) {
      console.error("Error switching resume:", error);
      toast.error("Failed to switch resume");
    } finally {
      setIsLoadingSwitcher(false);
    }
  };

  // Function to actually save the resume with the provided name
  const saveResumeWithCustomName = async () => {
    if (!resumeNameInput.trim()) {
      setSaveDialogError("Please enter a name for your resume");
      return;
    }

    setIsSavingToAccount(true);
    setSaveDialogError("");

    try {
      const dataToSave = isEditMode ? tempResumeData : enhancedResumeData;

      const cleanDataForFirestore = (data) => {
        if (!data) return data;
        const cleaned = JSON.parse(JSON.stringify(data));
        const removeUndefined = (obj) => {
          Object.keys(obj).forEach(key => {
            if (obj[key] === undefined) {
              delete obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              removeUndefined(obj[key]);
            }
          });
        };
        removeUndefined(cleaned);
        return cleaned;
      };

      const cleanedResumeData = cleanDataForFirestore(dataToSave);

      const { doc, collection, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      const resumeRef = doc(collection(db, "users", user.uid, "resumes"));
      const dataToSaveToFirestore = {
        resumeName: resumeNameInput.trim(),
        resumeData: cleanedResumeData,
        customColors: cleanDataForFirestore(customColors),
        template: selectedTemplate,
        language: "en",
        country: "us",
        preferences: {},
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        source: "job_description_builder",
        jobDescription: jobDescription, // Store FULL JD for history and switching
        jobDescriptionPreview: jobDescription.substring(0, 100), // Short preview for UI
        enhancementSummary: enhancementSummary || null
      };

      await setDoc(resumeRef, dataToSaveToFirestore);

      // Update current resume ID and name
      setCurrentResumeId(resumeRef.id);
      setCurrentResumeName(resumeNameInput.trim());

      // Reload the JD-created resumes list to include the newly saved resume
      try {
        const resumesRef = collection(db, "users", user.uid, "resumes");

        // Try query with fallback
        let snapshot;
        try {
          const q = query(
            resumesRef,
            where("source", "==", "job_description_builder"),
            orderBy("updatedAt", "desc")
          );
          snapshot = await getDocs(q);
        } catch (indexError) {
          // Fallback without orderBy
          const q = query(
            resumesRef,
            where("source", "==", "job_description_builder")
          );
          snapshot = await getDocs(q);
        }

        let resumes = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            resumeName: data.resumeName || "Untitled Resume",
            jobDescriptionPreview: data.jobDescription ?
              data.jobDescription.substring(0, 100) + "..." :
              (data.jobDescriptionPreview || "No JD saved"),
            updatedAt: data.updatedAt || new Date().toISOString()
          };
        });

        // Sort client-side
        resumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setJdCreatedResumes(resumes);
        console.log(`✅ Updated JD-created resumes list: ${resumes.length} resumes`);
      } catch (error) {
        console.error("❌ Error reloading JD-created resumes:", error);

        // Ultimate fallback: load all and filter
        try {
          const resumesRef = collection(db, "users", user.uid, "resumes");
          const allSnapshot = await getDocs(resumesRef);
          const jdResumes = allSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(r => r.source === "job_description_builder")
            .map(data => ({
              ...data,
              resumeName: data.resumeName || "Untitled Resume",
              jobDescriptionPreview: data.jobDescription ?
                data.jobDescription.substring(0, 100) + "..." :
                "No JD saved",
              updatedAt: data.updatedAt || new Date().toISOString()
            }))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          setJdCreatedResumes(jdResumes);
          console.log(`✅ Fallback reload successful: ${jdResumes.length} resumes`);
        } catch (fallbackError) {
          console.error("❌ Fallback reload failed:", fallbackError);
        }
      }

      // Save JD resume history for tracking and quick access
      let jdHistoryId = null;
      try {
        jdHistoryId = await saveJDResumeHistory(user.uid, {
          resumeId: resumeRef.id,
          resumeName: resumeNameInput.trim(),
          fileName: uploadedResume?.name || resumeNameInput.trim(),
          originalFileName: uploadedResume?.name || null,
          jobDescription: jobDescription,
          parsedResumeData: parsedResumeData || null,
          enhancedResumeData: cleanedResumeData,
          resumeData: cleanedResumeData,
          selectedTemplate: selectedTemplate,
          template: selectedTemplate,
          customColors: cleanDataForFirestore(customColors),
          preferences: {},
          enhancementSummary: enhancementSummary || null,
          source: "job_description_builder",
          clientId: selectedClient?.id || null,
          clientName: selectedClient?.name || null,
        });
        console.log("✅ JD resume history saved, ID:", jdHistoryId);
      } catch (historyError) {
        console.error("Error saving JD resume history:", historyError);
      }

      // Log activity for analytics
      try {
        const adminId = enterpriseMode ? await getAdminId(user.uid) : user.uid;
        await logActivity(adminId || user.uid, user.uid, ACTIVITY_TYPES.JD_RESUME_CREATED, {
          resumeId: resumeRef.id,
          historyId: jdHistoryId,
          jdResumeHistoryId: jdHistoryId,
          resumeName: resumeNameInput.trim(),
          template: selectedTemplate,
          source: "job_description_builder",
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
      }

      // Increment quota for enterprise users
      if (enterpriseMode) {
        try {
          const adminId = await getAdminId(user.uid);
          await incrementQuota(adminId || user.uid, QUOTA_TYPES.JD_RESUMES);
        } catch (quotaError) {
          console.error("Error incrementing JD resume quota:", quotaError);
        }
      }

      toast.success(`Resume "${resumeNameInput.trim()}" saved successfully!`);
      setShowSaveDialog(false);

      // Update current resume name for downloads
      setCurrentResumeName(resumeNameInput.trim());

      event({
        action: 'resume_saved_to_account',
        category: 'JobDescriptionBuilder',
        label: 'job_specific_resume'
      });

    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveDialogError("Failed to save resume. Please try again.");
    } finally {
      setIsSavingToAccount(false);
    }
  };

  // Handle job description input with keyword analysis
  const handleJobDescriptionChange = useCallback((value) => {
    setJobDescription(value);
    setProgress(prev => ({ ...prev, jobDescription: value.length > 50 }));

    // Comprehensive keyword detection for user feedback
    if (value.length > 100) {
      const keywordPatterns = [
        // Technical Skills & Technologies
        { pattern: /\b(ALM|Application Lifecycle Management|LCM|Lifecycle Management)\b/gi, type: 'Technical' },
        { pattern: /\b(roadmap|technical roadmap|backlog|sprint|agile|scrum|kanban|devops)\b/gi, type: 'Technical' },
        { pattern: /\b(technical debt|technical resilience|modernization|legacy|migration|upgrade)\b/gi, type: 'Technical' },
        { pattern: /\b(CI\/CD|continuous integration|continuous deployment|automation|pipeline)\b/gi, type: 'Technical' },
        { pattern: /\b(cloud|AWS|Azure|GCP|kubernetes|docker|microservices|API)\b/gi, type: 'Technical' },
        { pattern: /\b(database|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Oracle)\b/gi, type: 'Technical' },
        { pattern: /\b(Java|Python|JavaScript|React|Angular|Vue|Node\.js|Spring)\b/gi, type: 'Technical' },
        { pattern: /\b(machine learning|AI|artificial intelligence|data science|analytics)\b/gi, type: 'Technical' },
        { pattern: /\b(cybersecurity|security|encryption|authentication|authorization)\b/gi, type: 'Technical' },
        { pattern: /\b(monitoring|logging|alerting|observability|performance|scalability)\b/gi, type: 'Technical' },

        // Leadership & Management
        { pattern: /\b(create urgency|weigh risks|impactful decisions|strategic thinking|vision)\b/gi, type: 'Leadership' },
        { pattern: /\b(team lead|team management|mentoring|coaching|leadership|supervision)\b/gi, type: 'Leadership' },
        { pattern: /\b(project management|program management|portfolio management|PMP|PRINCE2)\b/gi, type: 'Leadership' },
        { pattern: /\b(budget|financial|cost|ROI|business case|stakeholder management)\b/gi, type: 'Leadership' },
        { pattern: /\b(change management|transformation|innovation|continuous improvement)\b/gi, type: 'Leadership' },
        { pattern: /\b(strategy|strategic|operational|tactical|executive|senior|principal)\b/gi, type: 'Leadership' },

        // Industry & Domain
        { pattern: /\b(24\/7|availability|uptime|reliability|resilience|disaster recovery)\b/gi, type: 'Industry' },
        { pattern: /\b(banking|finance|fintech|regulatory|compliance|audit|governance)\b/gi, type: 'Industry' },
        { pattern: /\b(healthcare|medical|pharmaceutical|HIPAA|FDA|clinical)\b/gi, type: 'Industry' },
        { pattern: /\b(retail|e-commerce|supply chain|logistics|inventory|customer experience)\b/gi, type: 'Industry' },
        { pattern: /\b(manufacturing|industrial|automation|quality|six sigma|lean)\b/gi, type: 'Industry' },
        { pattern: /\b(education|edtech|learning|training|curriculum|academic)\b/gi, type: 'Industry' },
        { pattern: /\b(real estate|property|construction|architecture|infrastructure)\b/gi, type: 'Industry' },
        { pattern: /\b(telecommunications|telco|networking|connectivity|5G|IoT)\b/gi, type: 'Industry' },
        { pattern: /\b(energy|utilities|renewable|sustainability|environmental)\b/gi, type: 'Industry' },
        { pattern: /\b(government|public sector|military|defense|security clearance)\b/gi, type: 'Industry' },

        // Soft Skills & Communication
        { pattern: /\b(communicate|communication|presentation|stakeholder|collaboration|teamwork)\b/gi, type: 'Soft Skills' },
        { pattern: /\b(problem solving|analytical|critical thinking|decision making|judgment)\b/gi, type: 'Soft Skills' },
        { pattern: /\b(adaptability|flexibility|learning|growth mindset|resilience)\b/gi, type: 'Soft Skills' },
        { pattern: /\b(customer focus|user experience|service orientation|empathy)\b/gi, type: 'Soft Skills' },
        { pattern: /\b(creativity|innovation|design thinking|out-of-the-box)\b/gi, type: 'Soft Skills' },
        { pattern: /\b(negotiation|influence|persuasion|conflict resolution|mediation)\b/gi, type: 'Soft Skills' },

        // Business & Process
        { pattern: /\b(business|commercial|revenue|profit|market|competitive|industry)\b/gi, type: 'Business' },
        { pattern: /\b(process|workflow|optimization|efficiency|productivity|streamline)\b/gi, type: 'Business' },
        { pattern: /\b(quality|standards|best practices|methodology|framework|policies)\b/gi, type: 'Business' },
        { pattern: /\b(risk|compliance|governance|audit|controls|regulatory)\b/gi, type: 'Business' },
        { pattern: /\b(data|analytics|insights|reporting|metrics|KPIs|dashboards)\b/gi, type: 'Business' },
        { pattern: /\b(customer|client|user|stakeholder|partner|vendor|supplier)\b/gi, type: 'Business' },

        // Action Verbs & Competencies
        { pattern: /\b(develop|design|implement|deploy|maintain|support|troubleshoot)\b/gi, type: 'Actions' },
        { pattern: /\b(manage|lead|coordinate|facilitate|organize|plan|execute)\b/gi, type: 'Actions' },
        { pattern: /\b(analyze|assess|evaluate|review|monitor|track|measure)\b/gi, type: 'Actions' },
        { pattern: /\b(create|build|establish|set up|configure|customize)\b/gi, type: 'Actions' },
        { pattern: /\b(improve|enhance|optimize|upgrade|modernize|transform)\b/gi, type: 'Actions' },
        { pattern: /\b(collaborate|partner|interface|integrate|connect|bridge)\b/gi, type: 'Actions' },

        // Experience & Qualifications
        { pattern: /\b(years? of experience|senior|principal|lead|architect|consultant)\b/gi, type: 'Experience' },
        { pattern: /\b(degree|bachelor|master|PhD|certification|certified|accredited)\b/gi, type: 'Experience' },
        { pattern: /\b(proven|demonstrated|track record|successful|achieved|delivered)\b/gi, type: 'Experience' },
        { pattern: /\b(scale|growth|expansion|international|global|multi-site)\b/gi, type: 'Experience' },
        { pattern: /\b(startup|enterprise|SMB|SME|fortune 500|unicorn)\b/gi, type: 'Experience' }
      ];

      // Group keywords by category and deduplicate
      const keywordGroups = {};

      keywordPatterns.forEach(({ pattern, type }) => {
        const matches = value.match(pattern);
        if (matches) {
          const uniqueMatches = [...new Set(matches)].map(match => match.toLowerCase());

          // Initialize category if it doesn't exist
          if (!keywordGroups[type]) {
            keywordGroups[type] = new Set();
          }

          // Add keywords to the category
          uniqueMatches.forEach(keyword => keywordGroups[type].add(keyword));
        }
      });

      // Convert grouped keywords to array format
      const detectedKeywords = Object.entries(keywordGroups)
        .map(([type, keywordsSet]) => ({
          type,
          keywords: Array.from(keywordsSet)
        }))
        .filter(group => group.keywords.length > 0)
        .sort((a, b) => b.keywords.length - a.keywords.length); // Sort by number of keywords

      // Store detected keywords for display
      setDetectedKeywords(detectedKeywords);
      console.log('Detected keywords for enhancement:', detectedKeywords);
    } else {
      // Clear keywords if job description is too short
      setDetectedKeywords([]);
    }
  }, []);

  // Handle resume file upload
  const handleResumeUpload = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Extract text from PDF
      const formData = new FormData();
      formData.append('file', file);

      const extractResponse = await fetch('/api/gemini-parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to parse resume');
      }

      const parsedData = await extractResponse.json();

      // Calculate years of experience from resume
      const calculateExperienceYears = (experiences) => {
        if (!Array.isArray(experiences) || experiences.length === 0) return 0;

        let totalMonths = 0;
        const currentDate = new Date();

        experiences.forEach(exp => {
          try {
            let startDate, endDate;

            // Parse start date
            if (exp.startDate) {
              startDate = new Date(exp.startDate);
              if (isNaN(startDate)) {
                // Try different date formats
                const dateStr = exp.startDate.toString().toLowerCase();
                if (dateStr.includes('present') || dateStr.includes('current')) {
                  startDate = currentDate;
                } else {
                  startDate = new Date(`${exp.startDate}-01`); // Add day if missing
                }
              }
            }

            // Parse end date
            if (exp.endDate) {
              const endStr = exp.endDate.toString().toLowerCase();
              if (endStr.includes('present') || endStr.includes('current')) {
                endDate = currentDate;
              } else {
                endDate = new Date(exp.endDate);
                if (isNaN(endDate)) {
                  endDate = new Date(`${exp.endDate}-01`);
                }
              }
            } else {
              endDate = currentDate;
            }

            // Calculate months for this experience
            if (startDate && endDate && startDate <= endDate) {
              const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth());
              totalMonths += Math.max(0, months);
            }
          } catch (error) {
            console.warn('Error calculating experience duration:', error);
          }
        });

        return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
      };

      // Normalize skills to handle both string and object formats for ResumePreview
      const normalizeSkills = (skills) => {
        if (!Array.isArray(skills)) return [];
        return skills.map(skill => {
          if (typeof skill === 'string') {
            return { name: skill };
          }
          if (typeof skill === 'object' && skill.name) {
            return skill;
          }
          if (typeof skill === 'object' && skill.skill) {
            return { name: skill.skill };
          }
          return { name: String(skill) };
        }).filter(Boolean);
      };

      // Ensure parsed data has proper structure
      const cleanedData = {
        ...parsedData,
        name: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        address: parsedData.address || '',
        jobTitle: parsedData.jobTitle || '',
        summary: parsedData.summary || '',
        experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        skills: normalizeSkills(parsedData.skills),
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
        languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
        customSections: Array.isArray(parsedData.customSections) ? parsedData.customSections : [],
        // Use Gemini-calculated years of experience, fallback to manual calculation if not provided
        yearsOfExperience: parsedData.yearsOfExperience || calculateExperienceYears(parsedData.experience) || 0
      };

      setUploadedResume(file);
      setParsedResumeData(cleanedData);
      setProgress(prev => ({ ...prev, resumeUpload: true }));

      // Perform intelligent matching analysis if job description exists
      if (jobDescription && jobDescription.length > 50) {
        analyzeJobResumeMatch(jobDescription, cleanedData).then(analysis => {
          if (analysis) {
            setMatchAnalysis(analysis);

            // Show warning based on Gemini's recommendation
            if (analysis.recommendation === 'reconsider' || analysis.matchPercentage < 60) {
              setShowMatchWarning(true);
            }

            console.log('Gemini Job-Resume Match Analysis:', analysis);
          }
        }).catch(error => {
          console.error('Failed to analyze job-resume match:', error);
        });
      }

      toast.success('Resume parsed successfully!');
      event({ action: 'resume_uploaded', category: 'JobDescriptionBuilder' });

      // Smooth scroll to resume parsed section after a short delay
      setTimeout(() => {
        const parsedSection = document.getElementById('resume-parsed-section');
        if (parsedSection) {
          parsedSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 500);

    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to parse resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhance resume based on job description
  const handleEnhanceResume = async () => {
    console.log("=== HANDLE ENHANCE RESUME ENTERED ===");
    console.log("User state:", !!user, "User object:", user);

    if (!jobDescription) {
      toast.error('Please provide a job description');
      return;
    }

    // Check quota for enterprise users before enhancing resume
    if (enterpriseMode && user) {
      try {
        const adminId = await getAdminId(user.uid);
        const quotaCheck = await checkQuota(adminId || user.uid, QUOTA_TYPES.JD_RESUMES);

        if (!quotaCheck.allowed) {
          setQuotaInfo({
            quotaType: "jdResumes",
            currentCount: quotaCheck.currentCount,
            limit: quotaCheck.limit,
            remaining: quotaCheck.remaining
          });
          setShowQuotaModal(true);
          return;
        }
      } catch (quotaError) {
        console.error("Error checking JD resume quota:", quotaError);
        toast.error("Unable to verify JD resume quota. Please try again.");
        return;
      }
    }

    // Validate job description length and content
    const trimmedDescription = jobDescription.trim();
    if (trimmedDescription.length < 50) {
      toast.error('Please provide a more detailed job description (at least 50 characters)');
      return;
    }

    if (trimmedDescription.length > 10000) {
      toast.error('Job description is too long. Please provide a shorter description (maximum 10,000 characters)');
      return;
    }

    // Check for common issues in job descriptions
    const hasReasonableContent = /[a-zA-Z]{3,}/.test(trimmedDescription);
    if (!hasReasonableContent) {
      toast.error('Please provide a valid job description with proper text content');
      return;
    }

    // Authentication and premium checks
    if (!user) {
      // Anonymous user - redirect to login with checkout intent
      handleConsistentUpgradeClick('basic', 'enhance-resume');
      event({ action: "login_redirect", category: "JobDescriptionBuilder", label: "EnhanceResume" });
      return;
    }

    // Check if basic plan user has reached enhancement limit
    if (checkBasicPlanEnhancementLimit()) {
      const isExpired = basicPlanExpiry && new Date() >= new Date(basicPlanExpiry);
      const message = isExpired
        ? "Your Basic Plan has expired. Purchase a new Basic Plan to get 1 more enhancement."
        : "You've used your 1 enhancement from your Basic Plan. Purchase a new Basic Plan for 1 more enhancement or upgrade to Premium for unlimited enhancements!";

      toast.error(message);

      // Navigate to checkout page
      router.push(`/checkout?billingCycle=quarterly&currency=${currency}&source=job-description-resume-builder&step=1`);
      return;
    }

    setIsProcessing(true);

    // Show different processing messages based on whether resume was uploaded
    const processingMessage = parsedResumeData
      ? "Analyzing your resume and tailoring it to the job requirements..."
      : "Creating a professional resume template based on the job description...";

    try {
      // Enhanced validation of resume data
      let processedResumeData = null;
      if (parsedResumeData) {
        // Ensure we have proper structure for enhancement
        processedResumeData = {
          ...parsedResumeData,
          // Ensure all required arrays exist
          experience: parsedResumeData.experience || [],
          education: parsedResumeData.education || [],
          skills: parsedResumeData.skills || [],
          certifications: parsedResumeData.certifications || [],
          languages: parsedResumeData.languages || [],
          customSections: parsedResumeData.customSections || []
        };

        console.log('Processing enhancement with existing resume:', {
          hasName: !!processedResumeData.name,
          experienceCount: processedResumeData.experience.length,
          skillsCount: processedResumeData.skills.length,
          hasEducation: processedResumeData.education.length > 0
        });
      }

      const response = await fetch('/api/enhance-resume-with-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: trimmedDescription,
          resumeData: processedResumeData,
          userId: user?.uid || 'anonymous',
          enhancementType: parsedResumeData ? 'enhance_existing' : 'create_new',
          bypassCache: true, // Always bypass cache for job-description-resume-builder
          timestamp: Date.now(), // Additional cache-busting parameter
          noCache: true, // Force no caching
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique request ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);

        // Provide more specific error messages based on the error type
        let errorMessage = errorData.details || 'Failed to enhance resume';

        if (errorData.details?.includes('GEMINI_API_KEY')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        } else if (errorData.details?.includes('overload') || errorData.details?.includes('unavailable')) {
          errorMessage = 'AI service is currently busy. Please try again in a moment.';
        } else if (errorData.details?.includes('configuration')) {
          errorMessage = 'Service configuration error. Please try again later.';
        } else if (errorData.details?.includes('parse')) {
          errorMessage = 'There was an issue processing the response. Please try again.';
        }

        throw new Error(errorMessage);
      }

      const enhancedData = await response.json();

      // Validate the enhanced resume has proper structure
      if (!enhancedData.enhancedResume || !enhancedData.enhancedResume.name) {
        throw new Error('Invalid enhanced resume format received');
      }

      // Ensure skills are properly formatted for ResumePreview component
      const processedEnhancedResume = {
        ...enhancedData.enhancedResume,
        skills: Array.isArray(enhancedData.enhancedResume.skills)
          ? enhancedData.enhancedResume.skills.map(skill => {
            if (typeof skill === 'string') {
              return { name: skill };
            }
            if (typeof skill === 'object' && skill.name) {
              return skill;
            }
            if (typeof skill === 'object' && skill.skill) {
              return { name: skill.skill };
            }
            return { name: String(skill) };
          })
          : []
      };

      setEnhancedResumeData(processedEnhancedResume);
      setEnhancementSummary(enhancedData.enhancementSummary || null);
      setTempResumeData(processedEnhancedResume); // Initialize temp data for editing
      setProgress(prev => ({ ...prev, enhancement: true, complete: true }));
      setCurrentStep(3);

      // Update usage count for authenticated users (skip for enterprise users)
      if (user && user.uid && !enterpriseMode) {
        try {
          const userRef = doc(db, "users", user.uid);
          const newCount = jobDescriptionEnhancements + 1;
          await updateDoc(userRef, { jobDescriptionEnhancements: newCount });
          setJobDescriptionEnhancements(newCount);

          // Show remaining enhancements message for basic plan users
          if (!isPremium && newCount < 1) {
            const remaining = 1 - newCount;
            toast.success(`Enhancement successful! ${remaining} enhancement remaining.`);
          }
        } catch (error) {
          console.error('Error updating usage count:', error);
        }
      }

      // Show success message based on enhancement type
      const successMessage = parsedResumeData
        ? 'Resume successfully enhanced and tailored to the job requirements!'
        : 'Professional resume template created based on your job description!';

      toast.success(successMessage);
      event({
        action: parsedResumeData ? 'resume_enhanced' : 'resume_created',
        category: 'JobDescriptionBuilder',
        label: enhancedData.model
      });

    } catch (error) {
      console.error('Enhancement error:', error);

      // More specific error messages based on error type
      let errorMessage;

      if (error.message.includes('temporarily unavailable') || error.message.includes('busy')) {
        errorMessage = 'AI service is temporarily busy. Please try again in a few minutes.';
      } else if (error.message.includes('configuration')) {
        errorMessage = 'Service configuration error. Please try again later.';
      } else if (error.message.includes('Invalid') || error.message.includes('parse')) {
        errorMessage = 'There was an issue processing your request. Please try again with a different job description.';
      } else if (error.message.includes('overload') || error.message.includes('unavailable')) {
        errorMessage = 'AI service is currently overloaded. Please try again in a moment.';
      } else if (parsedResumeData) {
        errorMessage = 'Failed to enhance your resume. Please check your uploaded resume and try again.';
      } else {
        errorMessage = 'Failed to create resume template. Please verify your job description and try again.';
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate PDF
  const handleGeneratePdf = async () => {
    const dataToUse = isEditMode ? tempResumeData : enhancedResumeData;
    if (!dataToUse) return;

    // Check if user has limited plan (oneDay or basic) and show upgrade modal
    // Enterprise users bypass this check
    if (!enterpriseMode && user && (billingCycle === "oneDay" || billingCycle === "basic")) {
      setShowUpgradeModal(true);
      return;
    }

    // Check template category and use the appropriate API
    const currentTemplate = templates[selectedTemplate] || atsFriendlyTemplates[selectedTemplate] || visualAppealTemplates[selectedTemplate] || premiumDesignTemplates[selectedTemplate];
    const isATSTemplate = currentTemplate?.category === "ATS-Optimized";
    const isVisualAppealTemplate = currentTemplate?.category === "Visual Appeal" || selectedTemplate?.startsWith('visual_');
    const isPremiumDesignTemplate = currentTemplate?.category === "Premium Design" || selectedTemplate?.startsWith('premium_');

    let apiEndpoint = "/api/generate-pdf"; // Default
    if (isPremiumDesignTemplate) {
      apiEndpoint = "/api/generate-premium-design-pdf";
    } else if (isATSTemplate) {
      apiEndpoint = "/api/generate-ats-pdf";
    } else if (isVisualAppealTemplate) {
      apiEndpoint = "/api/generate-visual-appeal-pdf";
    }

    // Auth Check
    if (!user) {
      toast.error("Please sign in to download your resume");
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // [NEW] Profile Guard Check
    // dataToUse is defined above in the file as either parsedResumeData or manual inputs
    // We need to ensure we pass the right object. 
    // In this file, 'dataToUse' seems to be strictly defined inside the ATS conditional block?
    // Let's check where 'dataToUse' comes from.
    // Actually lines 2075+ use 'dataToUse' but it's not defined in the snippet I see.
    // It must be defined above line 2050.
    // I'll assume 'dataToUse' is available in scope.
    // Wait, looking at previous context, line 2076 uses `data: dataToUse`.

    // [NEW] Profile Guard Check
    if (user) {
      const loadingId = toast.loading("Verifying profile access...");
      try {
        const { allowed, needsUpgrade, inProgress } = await checkProfileAccess(user, dataToUse, "jd_builder_download");

        if (inProgress) return;

        toast.dismiss(loadingId);

        if (!allowed) {
          if (needsUpgrade) {
            handleUpgradeClick("basic");
          }
          setIsGeneratingPdf(false);
          return;
        }
      } catch (error) {
        toast.dismiss(loadingId);
        console.error("Profile check failed", error);
        setIsGeneratingPdf(false);
        return;
      }
    }

    setIsGeneratingPdf(true);
    try {
      const requestBody = isPremiumDesignTemplate ? {
        data: dataToUse,
        template: selectedTemplate, // Send template key — API looks up from premiumDesignTemplates
        customColors,
        language: 'en',
        country: 'us',
        preferences: {}
      } : isATSTemplate ? {
        data: dataToUse,
        template: currentTemplate, // Send the full template object for ATS templates
        preferences: {}
      } : isVisualAppealTemplate ? {
        data: dataToUse,
        template: currentTemplate, // Send the full template object for Visual Appeal templates
        customColors,
        language: 'en',
        country: 'us'
      } : {
        data: dataToUse,
        template: selectedTemplate,
        customColors,
        language: 'en',
        country: 'us',
        isPremium: isPremium,
        userId: user?.uid
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check for enterprise required error
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error === "ENTERPRISE_REQUIRED") {
            setShowEnterpriseModal(true);
            return;
          }
        } catch (e) {
          // If JSON parsing fails, continue with normal error handling
        }

        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setPdfPreviewBlob(blob);

      // Use PremiumPdfPreview modal for all users
      setShowPremiumPdfModal(true);

      event({ action: 'pdf_generated', category: 'JobDescriptionBuilder' });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleUpgradeClick = (billingCycle = "quarterly") => {
    // Check if this upgrade was triggered from within the PDF modal
    if (showPremiumPdfModal) {
      // Handle upgrade from PDF modal
    }

    if (!user) {
      handleConsistentUpgradeClick(billingCycle, 'pdf-preview-upgrade');
      event({ action: "login_redirect", category: "Payment", label: "PdfPreviewUpgrade" });
      return;
    }

    // For authenticated users, redirect to checkout
    const effectiveBillingCycle = billingCycle;
    router.push(`/checkout?billingCycle=${effectiveBillingCycle}&currency=${currency}&source=job-description-resume-builder`);
  };



  // Edit mode functions
  const toggleEditMode = () => {
    if (isEditMode) {
      // Save changes when exiting edit mode
      setEnhancedResumeData(tempResumeData);
      setEditingSection(null);
    } else {
      // Initialize temp data when entering edit mode
      setTempResumeData({ ...enhancedResumeData });
    }
    setIsEditMode(!isEditMode);
  };

  const updateTempData = (section, value) => {
    setTempResumeData(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const addSkill = (newSkill) => {
    if (newSkill.trim()) {
      // Check if skill already exists (handle both string and object formats)
      const skillExists = tempResumeData.skills.some(skill => {
        const skillName = typeof skill === 'string' ? skill : skill?.name || skill?.skill || String(skill);
        return skillName.toLowerCase() === newSkill.trim().toLowerCase();
      });

      if (!skillExists) {
        // Add skill as object with name property for ResumePreview compatibility
        updateTempData('skills', [...tempResumeData.skills, { name: newSkill.trim() }]);
      }
    }
  };

  const removeSkill = (index) => {
    const newSkills = tempResumeData.skills.filter((_, i) => i !== index);
    updateTempData('skills', newSkills);
  };

  const addExperience = () => {
    const newExp = {
      jobTitle: "Job Title",
      company: "Company Name",
      location: "Location",
      startDate: "Start Date",
      endDate: "End Date",
      description: "Job description and achievements"
    };
    updateTempData('experience', [...tempResumeData.experience, newExp]);
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...tempResumeData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    updateTempData('experience', newExp);
  };

  const removeExperience = (index) => {
    const newExp = tempResumeData.experience.filter((_, i) => i !== index);
    updateTempData('experience', newExp);
  };

  // Intelligent Job-Resume Matching Analysis using Gemini AI
  const analyzeJobResumeMatch = useCallback(async (jobDesc, resumeData) => {
    if (!jobDesc || !resumeData || jobDesc.length < 50) return null;

    try {
      setIsAnalyzing(true);
      console.log('Starting Gemini-powered job-resume analysis...');

      const response = await fetch('/api/analyze-job-resume-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDesc,
          resumeData: resumeData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysis = await response.json();
      console.log('Gemini analysis completed:', analysis);

      // Transform Gemini response to match existing UI structure
      return {
        matchPercentage: analysis.matchScore,
        primaryJobFunction: analysis.primaryJobFunction,
        candidateBackground: analysis.candidateBackground,
        industryAlignment: analysis.industryAlignment,
        roleAlignment: analysis.roleAlignment,
        criticalGaps: analysis.criticalGaps || [],
        matchedStrengths: analysis.matchedStrengths || [],
        recommendation: analysis.recommendation,
        warningMessage: analysis.warningMessage,
        experienceGap: analysis.experienceGap || 0,
        reasoning: analysis.reasoning,
        // Legacy support for existing UI
        missingSkills: analysis.criticalGaps || [],
        matchedSkills: analysis.matchedStrengths || []
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      toast.error('Failed to analyze job compatibility');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const steps = [
    { id: 1, title: "Job Description", icon: Briefcase, description: "Paste the job posting you want to apply for" },
    { id: 2, title: "Upload Resume", icon: Upload, description: "Upload your existing resume (optional)" },
    { id: 3, title: "Enhanced Resume", icon: Sparkles, description: "Review and customize your tailored resume" }
  ];

  // Show upgrade modal if user tries to download with limited plan
  if (!enterpriseMode && showUpgradeModal && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade to Pro for JD Builder
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              The JD Builder feature is only available for <strong>Pro Monthly ({formatPrice(getEffectivePricing(currency).monthly, currency)})</strong> and <strong>Pro 6-Month ({formatPrice(getEffectivePricing(currency).sixMonth, currency)})</strong> plans.
            </p>
            <div className="bg-[#0B1F3B]/5 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Unlock with Pro Plans:</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#0B1F3B]" size={20} />
                  <span>JD Builder - Tailor to Any Job</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#0B1F3B]" size={20} />
                  <span>ExpertResume GPT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#0B1F3B]" size={20} />
                  <span>Salary Analyzer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#0B1F3B]" size={20} />
                  <span>Unlimited Downloads</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/checkout?billingCycle=quarterly&step=1')}
                className="flex-1 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#0B1F3B] hover:to-[#00C4B3]/90 transition-all"
              >
                Upgrade to Expert Plan
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="flex-1 border-2 border-[#0B1F3B] text-[#0B1F3B] px-6 py-3 rounded-lg font-semibold hover:bg-[#0B1F3B]/5 transition-all"
              >
                View All Plans
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for screen readers - Enhanced */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-[#0B1F3B] focus:text-white focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#00C4B3]/30 focus:font-semibold"
        tabIndex="1"
      >
        Skip to main content
      </a>



      {/* Authentication Banner for Anonymous Users - Enhanced Mobile */}
      {showAuthContent && !user && (
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 sm:py-4 px-4 sticky top-0 z-40 shadow-lg"
          role="banner"
          aria-label="Premium feature notification"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto text-center sm:text-left">
              <Lock className="text-white flex-shrink-0 hidden sm:block" size={20} aria-hidden="true" />
              <div className="flex-1 sm:flex-initial">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">🔒 Premium Feature</h3>
                <p className="text-xs sm:text-sm opacity-95 mt-0.5">Sign up to access AI-powered resume enhancement</p>
              </div>
            </div>
            <button
              onClick={() => handleConsistentUpgradeClick('monthly', 'premium-feature-banner')}
              className="w-full sm:w-auto bg-white text-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] text-sm sm:text-base shadow-md hover:shadow-lg touch-manipulation"
              aria-label="Upgrade to Pro plan"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}


      {/* Compact Page Header with History Access */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#00C4B3]/10 rounded-lg flex-shrink-0">
                <Bot size={24} className="text-[#0B1F3B]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate" title={currentResumeName}>
                    {currentResumeName && currentResumeName !== "Resume" ? currentResumeName : "AI Job Description Resume Builder"}
                  </h1>
                  {currentResumeName && currentResumeName !== "Resume" && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Editing
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {currentResumeName && currentResumeName !== "Resume"
                    ? "AI Job Description Resume Builder"
                    : "Tailor your resume to any job posting in minutes"}
                </p>
              </div>
            </div>

            {/* Header Actions - Resume Switcher */}
            {user && (
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                <button
                  onClick={() => {
                    if (jdCreatedResumes.length === 0) {
                      toast.error("No saved JD resumes yet. Save this resume first!");
                      return;
                    }
                    setShowResumeSwitcher(!showResumeSwitcher);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${jdCreatedResumes.length > 0
                    ? 'bg-[#00C4B3]/5 text-[#0B1F3B] hover:bg-[#00C4B3]/10 border border-[#00C4B3]/20'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                  disabled={jdCreatedResumes.length === 0}
                  aria-label="Switch Resume"
                  aria-expanded={showResumeSwitcher}
                  aria-haspopup="true"
                >
                  <div className="flex items-center gap-2">
                    <List size={18} />
                    <span className="hidden sm:inline">My Saved Resumes</span>
                    <span className="sm:hidden">History</span>
                  </div>
                  {jdCreatedResumes.length > 0 && (
                    <span className="bg-[#00C4B3]/20 text-[#0F172A] text-xs px-1.5 py-0.5 rounded-full">
                      {jdCreatedResumes.length}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${showResumeSwitcher ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showResumeSwitcher && jdCreatedResumes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 text-sm">Resume History</h3>
                        <button
                          onClick={() => setShowResumeSwitcher(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {jdCreatedResumes.map((resume) => (
                          <button
                            key={resume.id}
                            onClick={() => {
                              switchToResume(resume.id);
                              setShowResumeSwitcher(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all group relative ${currentResumeId === resume.id
                              ? 'bg-[#00C4B3]/5 border border-[#00C4B3]/20'
                              : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm truncate ${currentResumeId === resume.id ? 'text-[#0B1F3B]' : 'text-gray-900'}`}>
                                  {resume.resumeName}
                                </div>
                                <div className="text-xs text-gray-500 truncate mt-0.5 pr-4">
                                  {resume.jobDescriptionPreview}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {new Date(resume.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {currentResumeId === resume.id && (
                                <CheckCircle size={18} className="text-[#00C4B3] flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={() => {
                            // Logic for creating new resume - basically reset
                            // Note: Might need a confirm dialog if changes unsaved
                            window.location.href = '/job-description-resume-builder';
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-[#0B1F3B] hover:bg-[#0B1F3B]/5 rounded-lg transition-colors"
                        >
                          <PlusCircle size={16} />
                          Create New Resume
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps - Enhanced Mobile & Accessibility */}
      <nav
        className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200"
        aria-label="Progress steps"
        id="main-content"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ol className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6 min-w-max sm:min-w-0">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white shadow-lg shadow-[#00C4B3]/20 scale-105'
                      : currentStep > step.id
                        ? 'bg-green-50 text-green-700 border-2 border-green-300'
                        : 'bg-gray-50 text-gray-500 border-2 border-gray-200'
                      }`}
                    role="status"
                    aria-label={`Step ${step.id}: ${step.title} ${currentStep === step.id ? '- Current' : currentStep > step.id ? '- Completed' : '- Not started'}`}
                    aria-current={currentStep === step.id ? 'step' : undefined}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-full ${currentStep >= step.id
                      ? 'bg-white/20'
                      : currentStep > step.id
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                      }`}>
                      {currentStep > step.id ? (
                        <CheckCircle
                          size={14}
                          className="sm:w-5 sm:h-5 text-green-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <step.icon
                          size={14}
                          className="sm:w-5 sm:h-5"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="block">
                      <div className="font-bold text-xs sm:text-sm leading-tight whitespace-nowrap">{step.title}</div>
                      <div className="text-[10px] sm:text-xs opacity-80 hidden lg:block leading-tight mt-0.5">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight
                      size={14}
                      className="mx-1.5 sm:mx-3 text-gray-300 sm:w-4 sm:h-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </nav>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-16">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Job Description Section - Enhanced Mobile & Accessibility */}
              <section
                id="step-1-content"
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-gray-100"
                aria-labelledby="step1-heading"
              >
                {/* Quick Access Dashboard - Recent Resumes */}
                {user && jdCreatedResumes.length > 0 && (
                  <div className="mb-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-[#00C4B3]" />
                        <h3 className="font-semibold text-gray-800">Continue Working</h3>
                      </div>
                      <button
                        onClick={() => setShowResumeSwitcher(true)}
                        className="text-xs font-medium text-[#00C4B3] hover:text-[#0B1F3B] hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {jdCreatedResumes.slice(0, 3).map((resume) => (
                        <button
                          key={`dashboard-${resume.id}`}
                          onClick={() => switchToResume(resume.id)}
                          className="text-left group relative p-4 bg-white rounded-lg border border-gray-200 hover:border-[#00C4B3]/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="bg-[#00C4B3]/10 p-2 rounded-md group-hover:bg-[#00C4B3]/20 transition-colors">
                              <FileText size={18} className="text-[#00C4B3]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">
                              {new Date(resume.updatedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mt-3">
                            <h4 className="font-semibold text-sm text-gray-800 truncate group-hover:text-[#0B1F3B] transition-colors">
                              {resume.resumeName}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {resume.jobDescriptionPreview}
                            </p>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-[#00C4B3] font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            Continue Editing <ArrowRight size={12} className="ml-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="p-2 bg-[#00C4B3]/10 rounded-lg flex-shrink-0">
                    <Briefcase className="text-[#0B1F3B]" size={20} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div id="step1-heading" className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                        {user && jdCreatedResumes.length > 0 ? "Or Create New Resume" : "Step 1: Paste Job Description"}
                      </h2>
                      <Link href="/jobs-nearby" className="inline-flex items-center gap-1 bg-gradient-to-r from-[#00C4B3]/10 to-[#00C4B3]/10 text-[#0B1F3B] px-2 py-0.5 rounded-full text-xs font-medium hover:from-[#00C4B3]/20 hover:to-[#00C4B3]/20 transition-colors border border-[#00C4B3]/20 shadow-sm shrink-0">
                        <Briefcase size={12} />
                        <span>Jobs Found</span>
                      </Link>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Required to tailor your resume</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 leading-relaxed bg-[#0B1F3B]/5 p-3 sm:p-4 rounded-lg border border-[#E5E7EB]">
                  📋 Copy and paste the complete job description from any job posting. Our AI will analyze it to understand the required skills, experience, and keywords.
                  <span className="block mt-2">
                    💡 Pro Tip: Copy the full job posting including requirements and qualifications for the best results.
                  </span>
                </p>
                <div className="mb-2">
                  <label htmlFor="job-description-input" className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description
                  </label>
                </div>
                <textarea
                  id="job-description-input"
                  value={jobDescription}
                  onChange={(e) => handleJobDescriptionChange(e.target.value)}
                  placeholder="Paste the complete job description here...&#10;&#10;Include:&#10;• Job title&#10;• Requirements and qualifications&#10;• Responsibilities&#10;• Skills needed&#10;• Company information"
                  className="w-full h-56 sm:h-64 lg:h-72 p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#00C4B3]/20 focus:border-[#00C4B3] resize-none text-sm sm:text-base transition-all hover:border-gray-400 bg-gray-50 focus:bg-white font-mono leading-relaxed touch-manipulation"
                  aria-describedby="job-description-hint character-count"
                  aria-required="true"
                  aria-invalid={jobDescription.length > 0 && jobDescription.length < 50}
                />
                <p id="job-description-hint" className="text-xs sm:text-sm text-gray-500 mt-2">
                  💡 Paste a complete job description with at least 50 characters for accurate AI analysis
                </p>

                {/* Compact Keyword Detection Display */}
                {detectedKeywords.length > 0 && (
                  <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <h3 className="font-semibold text-green-800 text-sm">Key Requirements Detected</h3>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {detectedKeywords.reduce((total, group) => total + group.keywords.length, 0)} keywords
                      </span>
                    </div>

                    {/* Compact keyword display with collapsible categories */}
                    <div className="space-y-2">
                      {detectedKeywords.slice(0, 3).map((group, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                            {group.type}
                          </span>
                          <div className="flex flex-wrap gap-1 flex-1">
                            {group.keywords.slice(0, 6).map((keyword, kIndex) => (
                              <span
                                key={kIndex}
                                className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                            {group.keywords.length > 6 && (
                              <span className="text-xs text-green-600 px-1.5 py-0.5">
                                +{group.keywords.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Show additional categories if more than 3 */}
                      {detectedKeywords.length > 3 && (
                        <div className="pt-1 border-t border-green-200">
                          <details className="group">
                            <summary className="text-xs text-green-600 cursor-pointer hover:text-green-700 list-none">
                              <span className="group-open:hidden">Show {detectedKeywords.length - 3} more categories</span>
                              <span className="hidden group-open:inline">Hide additional categories</span>
                            </summary>
                            <div className="mt-2 space-y-2">
                              {detectedKeywords.slice(3).map((group, index) => (
                                <div key={index + 3} className="flex items-start gap-2">
                                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                                    {group.type}
                                  </span>
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {group.keywords.slice(0, 4).map((keyword, kIndex) => (
                                      <span
                                        key={kIndex}
                                        className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                    {group.keywords.length > 4 && (
                                      <span className="text-xs text-green-600 px-1.5 py-0.5">
                                        +{group.keywords.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>

                    <p className="text-green-600 text-xs mt-2 italic">
                      ✨ These keywords will be strategically integrated throughout your enhanced resume
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-5">
                  <div
                    id="character-count"
                    className="flex items-center justify-between sm:justify-start gap-2 text-sm px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="font-medium text-gray-700">
                      {jobDescription.length} characters
                      {jobDescription.length >= 50 && <span className="text-green-600 ml-1">✓</span>}
                    </span>
                    {jobDescription.length < 50 && (
                      <span className="text-xs text-gray-500">
                        {50 - jobDescription.length} more needed
                      </span>
                    )}
                    {jobDescription.length >= 50 && (
                      <CheckCircle
                        size={18}
                        className="text-green-500"
                        aria-label="Minimum character requirement met"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={jobDescription.length < 50}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white rounded-xl hover:from-[#0B1F3B] hover:to-[#00C4B3]/90 focus:outline-none focus:ring-4 focus:ring-[#00C4B3]/30 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl disabled:shadow-none min-h-[48px] sm:min-h-[52px] active:scale-95 touch-manipulation"
                    aria-label="Proceed to step 2: Upload Resume"
                    aria-disabled={jobDescription.length < 50}
                  >
                    <span>Next: Upload Resume</span>
                    <ArrowRight size={20} className="sm:w-5 sm:h-5" aria-hidden="true" />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Resume Upload Section - Enhanced Mobile & Accessibility */}
              <section
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-gray-100"
                aria-labelledby="step2-heading"
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="p-2 bg-[#00C4B3]/10 rounded-lg flex-shrink-0">
                    <Upload className="text-[#0B1F3B]" size={20} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 id="step2-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                      Step 2: Upload Your Resume{' '}
                      <span className="inline-block text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">(Optional)</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Upload existing or skip to create new</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-[#0B1F3B]/5 to-[#00C4B3]/10 p-4 sm:p-5 rounded-xl border-2 border-[#00C4B3]/20 shadow-sm"
                  >
                    <h3 className="font-bold text-[#0F172A] mb-2 text-sm sm:text-base flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">✅</span>
                      <span>Have an existing resume?</span>
                    </h3>
                    <p className="text-[#0F172A] text-xs sm:text-sm leading-relaxed">
                      Upload it and we'll intelligently enhance it to perfectly match the job description while preserving your authentic experience.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 rounded-xl border-2 border-green-200 shadow-sm"
                  >
                    <h3 className="font-bold text-green-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">🚀</span>
                      <span>Starting from scratch?</span>
                    </h3>
                    <p className="text-green-800 text-xs sm:text-sm leading-relaxed">
                      No problem! Skip this step and we'll create a professional resume template tailored to the job that you can customize.
                    </p>
                  </motion.div>
                </div>

                {/* File Upload Area - Enhanced */}
                <div className="border-3 border-dashed border-gray-300 rounded-xl p-6 sm:p-10 text-center hover:border-[#00C4B3] hover:bg-[#0B1F3B]/5/30 focus-within:border-[#00C4B3] focus-within:ring-4 focus-within:ring-[#00C4B3]/20 transition-all bg-gradient-to-br from-gray-50 to-white">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleResumeUpload(e.target.files[0])}
                    className="sr-only"
                    id="resume-upload"
                    aria-label="Upload resume PDF file"
                    aria-describedby="upload-instructions"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer block touch-manipulation"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('resume-upload').click();
                      }
                    }}
                    role="button"
                    aria-label="Click to upload resume file"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#00C4B3]/10 rounded-2xl mb-4 sm:mb-5">
                      <Upload size={32} className="sm:w-10 sm:h-10 text-[#0B1F3B]" aria-hidden="true" />
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">
                      Drop your resume here or click to upload
                    </p>
                    <p id="upload-instructions" className="text-xs sm:text-sm text-gray-600 mb-3">
                      📄 Supports PDF files up to 10MB
                    </p>
                    <div className="inline-block bg-[#0B1F3B] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#0B1F3B]/90 transition-colors shadow-md">
                      Choose File
                    </div>
                  </label>
                </div>

                {uploadedResume && parsedResumeData && (
                  <div id="resume-parsed-section" className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-3">
                      <CheckCircle size={20} />
                      <span className="font-semibold">Resume parsed successfully!</span>
                    </div>

                    {/* Detailed Resume Data Summary */}
                    <div className="text-sm text-green-700 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="font-medium">👤 Name:</span> {parsedResumeData.name || 'Not detected'}
                        </div>
                        <div>
                          <span className="font-medium">📧 Email:</span> {parsedResumeData.email || 'Not detected'}
                        </div>
                        <div>
                          <span className="font-medium">💼 Job Title:</span> {parsedResumeData.jobTitle || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">📱 Phone:</span> {parsedResumeData.phone || 'Not detected'}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-green-200">
                        <div className="text-center">
                          <div className="font-bold text-lg text-green-800">{parsedResumeData.yearsOfExperience || 0}</div>
                          <div className="text-xs">Years Experience</div>
                          {parsedResumeData.yearsOfExperience && (
                            <div className="text-xs text-[#0B1F3B] font-medium mt-1">✨ AI Calculated</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-green-800">{parsedResumeData.experience?.length || 0}</div>
                          <div className="text-xs">Job Roles</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-green-800">{parsedResumeData.skills?.length || 0}</div>
                          <div className="text-xs">Skills</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-green-800">{parsedResumeData.education?.length || 0}</div>
                          <div className="text-xs">Education</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-green-200">
                        <p className="text-green-600 font-medium flex items-center gap-2">
                          ✨ Ready to intelligently enhance your resume to match the job requirements!
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          We'll optimize your experience descriptions, prioritize relevant skills, and ensure ATS compatibility.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Loading State */}
                {isAnalyzing && (
                  <div className="mt-6 p-4 bg-[#0B1F3B]/5 border border-[#00C4B3]/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="text-[#0B1F3B] animate-spin" size={16} />
                      <span className="text-[#0F172A] font-semibold text-sm">Analyzing job compatibility...</span>
                    </div>
                    <p className="text-[#0B1F3B] text-xs">
                      AI is analyzing your background against job requirements to provide intelligent matching insights.
                    </p>
                  </div>
                )}

                {/* Match Analysis Results */}
                {matchAnalysis && !isAnalyzing && (
                  <div className={`mt-6 p-4 rounded-lg border ${matchAnalysis.matchPercentage >= 80
                    ? 'bg-green-50 border-green-300'
                    : matchAnalysis.matchPercentage >= 60
                      ? 'bg-[#0B1F3B]/5 border-[#00C4B3]/30'
                      : 'bg-amber-50 border-amber-300'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className={`${matchAnalysis.matchPercentage >= 80
                        ? 'text-green-600'
                        : matchAnalysis.matchPercentage >= 60
                          ? 'text-[#0B1F3B]'
                          : 'text-amber-600'
                        }`} size={20} />
                      <h3 className={`font-semibold ${matchAnalysis.matchPercentage >= 80
                        ? 'text-green-800'
                        : matchAnalysis.matchPercentage >= 60
                          ? 'text-[#0F172A]'
                          : 'text-amber-800'
                        }`}>
                        Job Match Analysis: {matchAnalysis.matchPercentage}%
                        {matchAnalysis.matchPercentage >= 80 && ' - Excellent Match! 🎯'}
                        {matchAnalysis.matchPercentage >= 60 && matchAnalysis.matchPercentage < 80 && ' - Good Match! ✅'}
                      </h3>
                    </div>

                    {/* Core Role vs Background Analysis */}
                    {(matchAnalysis.primaryJobFunction || matchAnalysis.candidateBackground) && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Role Analysis:</h4>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          {matchAnalysis.primaryJobFunction && (
                            <div>
                              <span className="font-medium text-gray-700">Job Function:</span>
                              <p className="text-gray-600">{highlightCriticalText(matchAnalysis.primaryJobFunction, false)}</p>
                            </div>
                          )}
                          {matchAnalysis.candidateBackground && (
                            <div>
                              <span className="font-medium text-gray-700">Your Background:</span>
                              <p className="text-gray-600">{highlightCriticalText(matchAnalysis.candidateBackground, false)}</p>
                            </div>
                          )}
                        </div>
                        {matchAnalysis.industryAlignment === false && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <span className="text-red-700 text-sm font-medium">⚠️ Industry Mismatch Detected</span>
                          </div>
                        )}
                      </div>
                    )}

                    {matchAnalysis.matchPercentage >= 80 && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded">
                        <p className="text-green-700 text-sm">
                          🎉 Excellent match! Your background aligns very well with this job's requirements.
                          You should feel confident applying for this position.
                        </p>
                        {matchAnalysis.reasoning && (
                          <p className="text-green-600 text-xs mt-1 italic">
                            {highlightCriticalText(matchAnalysis.reasoning, false)}
                          </p>
                        )}
                      </div>
                    )}

                    {matchAnalysis.matchPercentage >= 60 && matchAnalysis.matchPercentage < 80 && (
                      <div className="mb-4 p-3 bg-[#00C4B3]/10 border border-[#00C4B3]/20 rounded">
                        <p className="text-[#0B1F3B] text-sm">
                          ✅ Good match! You meet most requirements. Consider highlighting your relevant experience
                          and addressing any skill gaps in your cover letter.
                        </p>
                        {matchAnalysis.reasoning && (
                          <p className="text-[#0B1F3B] text-xs mt-1 italic">
                            {highlightCriticalText(matchAnalysis.reasoning, false)}
                          </p>
                        )}
                      </div>
                    )}

                    {matchAnalysis.matchPercentage < 60 && showMatchWarning && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {matchAnalysis.recommendation === 'reconsider' ? (
                            <>
                              <span className="text-red-600">🚫</span>
                              <span className="font-semibold text-red-700">Strong Mismatch - Consider Different Role</span>
                            </>
                          ) : matchAnalysis.matchPercentage < 40 ? (
                            <>
                              <span className="text-red-600">⚠️</span>
                              <span className="font-semibold text-red-700">Low Match - This role may not be suitable</span>
                            </>
                          ) : (
                            <>
                              <span className="text-amber-600">⚡</span>
                              <span className="font-semibold text-amber-700">Moderate Match - Skills gap identified</span>
                            </>
                          )}
                        </div>
                        {matchAnalysis.warningMessage ? (
                          <p className="text-sm text-amber-700 mb-3">
                            {highlightCriticalText(matchAnalysis.warningMessage, true)}
                          </p>
                        ) : (
                          <p className="text-sm text-amber-700 mb-3">
                            Your background has some gaps for this position. Consider the analysis below:
                          </p>
                        )}
                        {matchAnalysis.reasoning && (
                          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                            <p className="text-amber-700 text-xs italic">
                              {highlightCriticalText(matchAnalysis.reasoning, true)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {matchAnalysis.matchPercentage < 60 && showMatchWarning && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {/* Critical Gaps */}
                          {matchAnalysis.criticalGaps && matchAnalysis.criticalGaps.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-red-800 mb-2 text-sm">Critical Gaps:</h4>
                              <div className="flex flex-wrap gap-1">
                                {matchAnalysis.criticalGaps.slice(0, 6).map((gap, index) => (
                                  <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                    {gap}
                                  </span>
                                ))}
                                {matchAnalysis.criticalGaps.length > 6 && (
                                  <span className="text-red-600 text-xs">
                                    +{matchAnalysis.criticalGaps.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Matched Strengths */}
                          {matchAnalysis.matchedStrengths && matchAnalysis.matchedStrengths.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2 text-sm">Your Strengths:</h4>
                              <div className="flex flex-wrap gap-1">
                                {matchAnalysis.matchedStrengths.slice(0, 6).map((strength, index) => (
                                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                    {strength}
                                  </span>
                                ))}
                                {matchAnalysis.matchedStrengths.length > 6 && (
                                  <span className="text-green-600 text-xs">
                                    +{matchAnalysis.matchedStrengths.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Experience Gap */}
                        {matchAnalysis.experienceGap && matchAnalysis.experienceGap > 0 && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <span className="text-red-700 text-sm">
                              📅 Experience Gap: {matchAnalysis.experienceGap} years short of requirements
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Action Buttons */}
                    {matchAnalysis.matchPercentage < 60 && showMatchWarning && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-amber-200">
                        <button
                          onClick={() => setShowMatchWarning(false)}
                          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm ${matchAnalysis.recommendation === 'reconsider'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                        >
                          {matchAnalysis.recommendation === 'reconsider'
                            ? 'Continue despite mismatch'
                            : 'I understand, proceed anyway'}
                        </button>
                        <button
                          onClick={() => {
                            setCurrentStep(1);
                            setUploadedResume(null);
                            setParsedResumeData(null);
                            setMatchAnalysis(null);
                            setShowMatchWarning(false);
                            setIsAnalyzing(false);
                          }}
                          className="flex-1 px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                        >
                          {matchAnalysis.recommendation === 'reconsider'
                            ? 'Find better matching job'
                            : 'Try different job description'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!uploadedResume && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Sparkles size={20} />
                      <span className="font-semibold">Creating from scratch</span>
                    </div>
                    <p className="text-amber-600 mt-1">
                      We'll create a professional resume template tailored to your job description that you can customize with your information.
                    </p>
                  </div>
                )}

                {/* Authentication Notice for Anonymous Users */}
                {/* {showAuthContent && !user && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 border-2 border-[#00C4B3]/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="text-[#0B1F3B]" size={20} />
                      <div>
                        <h4 className="font-semibold text-[#0F172A]">Sign Up Required</h4>
                        <p className="text-[#0B1F3B] text-sm">Create an account to access AI-powered resume enhancement</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleConsistentUpgradeClick('basic', 'sign-up-start-building')}
                        className="flex-1 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0B1F3B]/90 transition-colors"
                      >
                        Sign Up & Start Building
                      </button>
                      <button
                        onClick={() => router.push('/login')}
                        className="flex-1 border border-[#0B1F3B] text-[#0B1F3B] px-4 py-2 rounded-lg font-semibold hover:bg-[#0B1F3B]/5 transition-colors"
                      >
                        Already have an account? Login
                      </button>
                    </div>
                  </div>
                )} */}

                {/* Usage Count Display - Hide for enterprise users */}
                {user && !enterpriseMode && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="text-yellow-600" size={16} />
                        <span className="text-sm font-medium text-gray-700">
                          {isPremium ? 'Premium User' : 'Basic Plan'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {isPremium ? (
                          <span className="text-green-600 font-medium">Unlimited Enhancements</span>
                        ) : (
                          <span className="text-gray-700">
                            {jobDescriptionEnhancements} of 1 enhancement used
                            <span className="text-[#0B1F3B] font-medium ml-1">
                              ({1 - jobDescriptionEnhancements} remaining)
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    {!isPremium && jobDescriptionEnhancements >= 1 && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                        ⚠️ You've used your enhancement. Consider upgrading to Premium for unlimited access.
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Action Buttons - Mobile Optimized */}
                <div className="mt-6 sm:mt-8 space-y-4">
                  {/* Condensed Enhancement Info */}
                  <div className="p-4 bg-gradient-to-br from-[#0B1F3B]/5 to-[#00C4B3]/5 border-2 border-[#00C4B3]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-[#0B1F3B] rounded-lg">
                        <Sparkles className="text-white" size={16} />
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-sm sm:text-base">
                        {parsedResumeData ? '✨ Smart AI Enhancement' : '🚀 AI Resume Creation'}
                      </h4>
                    </div>
                    <p className="text-[#0F172A] text-xs sm:text-sm leading-relaxed">
                      {parsedResumeData
                        ? 'Our AI will intelligently optimize your existing content for this specific job while maintaining your authentic voice and experience.'
                        : 'Our AI will create a professional, ATS-optimized resume template with relevant skills and keywords tailored to the job description.'
                      }
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all text-sm sm:text-base font-semibold min-h-[48px] sm:min-h-[52px] active:scale-95 touch-manipulation shadow-sm"
                      aria-label="Go back to step 1"
                    >
                      ← Back to Job Description
                    </button>

                    <button
                      onClick={() => {
                        console.log("=== MAIN BUTTON CLICKED ===");
                        console.log("User state:", !!user, "User object:", user);
                        console.log("Job description length:", jobDescription?.length);
                        console.log("Is processing:", isProcessing);
                        console.log("Is analyzing:", isAnalyzing);
                        console.log("Button disabled:", !jobDescription || isProcessing || isAnalyzing);
                        handleEnhanceResume();
                      }}
                      disabled={!jobDescription || isProcessing || isAnalyzing}
                      className="w-full sm:flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white rounded-xl hover:from-[#0B1F3B] hover:to-[#00C4B3]/90 focus:outline-none focus:ring-4 focus:ring-[#00C4B3]/30 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl disabled:shadow-none min-h-[52px] sm:min-h-[56px] active:scale-95 disabled:active:scale-100 touch-manipulation"
                      aria-label={parsedResumeData ? 'Enhance my resume with AI' : 'Create tailored resume with AI'}
                      aria-busy={isAnalyzing || isProcessing}
                      aria-live="polite"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw size={20} className="animate-spin" aria-hidden="true" />
                          <span>Analyzing...</span>
                        </>
                      ) : isProcessing ? (
                        <>
                          <RefreshCw size={20} className="animate-spin" aria-hidden="true" />
                          <span>{parsedResumeData ? 'Enhancing...' : 'Creating...'}</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={20} aria-hidden="true" />
                          <span>{parsedResumeData ? '✨ Enhance My Resume' : '🚀 Create Tailored Resume'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* Condensed Process Info */}
              {!parsedResumeData && (
                <div className="bg-[#0B1F3B]/5 border border-[#00C4B3]/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-[#0B1F3B]" size={16} />
                    <h4 className="font-semibold text-[#0F172A]">Quick Process Overview</h4>
                  </div>
                  <p className="text-[#0B1F3B] text-sm">
                    AI analyzes job requirements → {parsedResumeData ? 'Enhances your resume' : 'Creates template'} → ATS optimization → Instant download
                  </p>
                </div>
              )}


            </motion.div>
          )}

          {currentStep === 3 && enhancedResumeData && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pb-20 sm:pb-0" // Add bottom padding for fixed buttons on mobile
            >
              {/* Enhanced Resume Section - Mobile Optimized */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Mobile Quick Actions Bar - Visible only on mobile */}
                <div className="lg:hidden bg-white rounded-xl shadow-lg p-4 sticky top-0 z-20 border-b-2 border-[#00C4B3]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-green-600" size={18} />
                      <h3 className="text-base font-bold text-gray-800">Resume Ready!</h3>
                    </div>
                    {showAuthContent && user && !isPremium && !enterpriseMode && (
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        <span className="text-gray-600">{jobDescriptionEnhancements}/1 used</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={toggleEditMode}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold min-h-[44px] ${isEditMode
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Edit size={16} />
                      <span>{isEditMode ? 'Save' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={handleGeneratePdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#0B1F3B]/90 disabled:bg-gray-300 transition-colors text-sm font-semibold min-h-[44px] shadow-md"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Left Panel - Control Panel - Desktop Only */}
                <div className="hidden lg:block lg:col-span-1 space-y-4">
                  {/* Control Panel */}
                  <div className="bg-white rounded-xl shadow-lg p-5 sticky top-4 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                      <Sparkles className="text-green-600" size={18} />
                      Enhanced Resume Ready!
                    </h3>

                    {/* Usage Count Display - Hide for enterprise users */}
                    {showAuthContent && user && !enterpriseMode && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="text-yellow-600" size={14} />
                            <span className="text-xs font-medium text-gray-700">
                              {isPremium ? 'Premium User' : 'Basic Plan'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {isPremium ? (
                              <span className="text-green-600 font-medium">Unlimited</span>
                            ) : (
                              <span className="text-gray-700">
                                {jobDescriptionEnhancements} of 1 used
                                <span className="text-[#0B1F3B] font-medium ml-1">
                                  ({1 - jobDescriptionEnhancements} remaining)
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Primary Actions Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={toggleEditMode}
                          className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg transition-colors text-sm ${isEditMode
                            ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          <Edit size={16} />
                          <span>{isEditMode ? 'Save & Exit' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={handleGeneratePdf}
                          disabled={isGeneratingPdf}
                          className="flex items-center justify-center gap-2 p-2.5 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#0B1F3B]/90 disabled:bg-gray-300 transition-colors text-sm"
                        >
                          {isGeneratingPdf ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowTemplateSelector(true)}
                          className="flex items-center justify-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Palette size={16} />
                          <span>Template</span>
                        </button>

                        <button
                          onClick={() => setShowColorCustomizer(true)}
                          className="flex items-center justify-center gap-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Palette size={16} />
                          <span>Colors</span>
                        </button>
                      </div>

                      {isEditMode && (
                        <div className="hidden sm:block bg-[#0B1F3B]/5 border border-[#00C4B3]/20 rounded-lg p-3 text-xs text-[#0B1F3B]">
                          <p className="font-medium mb-1">📝 Edit Mode Tips:</p>
                          <ul className="space-y-0.5 text-xs">
                            <li>• Click any section to edit it</li>
                            <li>• Use X icons to remove skills</li>
                            <li>• Add new experiences and skills</li>
                            <li>• Changes save automatically</li>
                          </ul>
                        </div>
                      )}

                      {/* Additional Actions */}
                      <div className="space-y-2">


                        {/* JD History/Viewer Button */}
                        {user && jobDescription && (
                          <button
                            onClick={() => setShowJDHistory(!showJDHistory)}
                            className="w-full flex items-center justify-between gap-2 p-2.5 border-2 border-[#00C4B3]/30 bg-[#0B1F3B]/5 text-[#0B1F3B] rounded-lg hover:bg-[#00C4B3]/10 transition-all text-sm font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <FileCheck size={16} />
                              <span>View Job Description</span>
                            </div>
                            <ChevronDown
                              size={14}
                              className={`transform transition-transform ${showJDHistory ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}

                        {user && (
                          <button
                            onClick={() => {
                              if (isSavingToAccount) return;
                              openSaveDialog();
                            }}
                            disabled={isSavingToAccount}
                            className="w-full flex items-center justify-center gap-2 p-2.5 border border-[#0B1F3B] text-[#0B1F3B] rounded-lg hover:bg-[#0B1F3B]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <Save size={16} />
                            <span>Save to Account</span>
                          </button>
                        )}

                        {isEditMode && (
                          <button
                            onClick={() => {
                              setTempResumeData({ ...enhancedResumeData });
                              setEditingSection(null);
                              toast.success('Changes discarded!');
                            }}
                            className="w-full flex items-center justify-center gap-2 p-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            <RefreshCw size={16} />
                            <span>Discard Changes</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setCurrentStep(1);
                            setJobDescription("");
                            setUploadedResume(null);
                            setParsedResumeData(null);
                            setEnhancedResumeData(null);
                            setEnhancementSummary(null);
                            setTempResumeData(null);
                            setIsEditMode(false);
                            setEditingSection(null);
                            setDetectedKeywords([]);
                            setMatchAnalysis(null);
                            setShowMatchWarning(false);
                            setIsAnalyzing(false);
                            setProgress({ jobDescription: false, resumeUpload: false, enhancement: false, complete: false });
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <RefreshCw size={16} />
                          <span>Start Over</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhancement Summary Section - Moved to Left Panel Below Control Panel */}
                  {enhancementSummary && (
                    <div className="bg-gradient-to-br from-[#0B1F3B]/5 to-[#00C4B3]/5 rounded-xl shadow-lg p-6 border border-[#E5E7EB]">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#0F172A]">
                        <Sparkles className="text-[#0B1F3B]" />
                        Enhancement Summary
                      </h3>

                      {/* Overall Transformation */}
                      {enhancementSummary.overallTransformation && (
                        <div className="mb-4 p-3 bg-[#00C4B3]/10 border border-[#00C4B3]/20 rounded-lg">
                          <p className="text-[#0F172A] text-sm font-medium mb-1">🎯 Overall Changes:</p>
                          <p className="text-[#0B1F3B] text-xs">{enhancementSummary.overallTransformation}</p>
                        </div>
                      )}

                      {/* What was Missing/Added */}
                      <div className="space-y-3">
                        {enhancementSummary.originalGaps && enhancementSummary.originalGaps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-800 mb-2">❌ What was Missing:</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {enhancementSummary.originalGaps.slice(0, 4).map((gap, index) => (
                                <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                  {gap}
                                </span>
                              ))}
                              {enhancementSummary.originalGaps.length > 4 && (
                                <span className="text-red-600 text-xs">+{enhancementSummary.originalGaps.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        {enhancementSummary.addedElements && enhancementSummary.addedElements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-green-800 mb-2">✅ What was Added:</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {enhancementSummary.addedElements.slice(0, 4).map((element, index) => (
                                <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                  {element}
                                </span>
                              ))}
                              {enhancementSummary.addedElements.length > 4 && (
                                <span className="text-green-600 text-xs">+{enhancementSummary.addedElements.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Keyword Changes */}
                        {enhancementSummary.keywordChanges && (
                          <div>
                            <h4 className="text-sm font-semibold text-[#0F172A] mb-2">🔄 Keywords Enhanced:</h4>
                            <div className="space-y-1">
                              {enhancementSummary.keywordChanges.added && enhancementSummary.keywordChanges.added.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {enhancementSummary.keywordChanges.added.slice(0, 3).map((keyword, index) => (
                                    <span key={index} className="bg-[#00C4B3]/10 text-[#0B1F3B] px-2 py-1 rounded text-xs">
                                      +{keyword}
                                    </span>
                                  ))}
                                  {enhancementSummary.keywordChanges.added.length > 3 && (
                                    <span className="text-[#00C4B3] text-xs">+{enhancementSummary.keywordChanges.added.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience Enhancements */}
                        {enhancementSummary.experienceEnhancements && enhancementSummary.experienceEnhancements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-orange-800 mb-2">💼 Experience Enhanced:</h4>
                            <div className="space-y-2">
                              {enhancementSummary.experienceEnhancements.slice(0, 2).map((exp, index) => (
                                <div key={index} className="bg-orange-50 border border-orange-200 rounded p-2">
                                  <p className="text-orange-800 text-xs font-medium">
                                    {exp.originalRole} → {exp.enhancedRole}
                                  </p>
                                  {exp.changesExplained && (
                                    <p className="text-orange-700 text-xs mt-1">{exp.changesExplained}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rewritten Sections */}
                        {enhancementSummary.rewrittenSections && enhancementSummary.rewrittenSections.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-[#0F172A] mb-2">✏️ Sections Rewritten:</h4>
                            <div className="flex flex-wrap gap-1">
                              {enhancementSummary.rewrittenSections.map((section, index) => (
                                <span key={index} className="bg-[#00C4B3]/10 text-[#0B1F3B] px-2 py-1 rounded text-xs">
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resume Preview / Editor */}
                <div className="col-span-1 lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="border-b border-gray-200 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                          {isEditMode ? (
                            <>
                              <Edit size={18} className="text-green-600" />
                              Edit Resume
                            </>
                          ) : (
                            <>
                              <Eye size={18} className="text-[#0B1F3B]" />
                              Enhanced Resume Preview
                            </>
                          )}
                        </h3>
                        {isEditMode && (
                          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold text-xs">
                            <Edit size={12} />
                            <span>Edit Mode</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 h-full overflow-y-auto">
                      <div className="min-h-full">
                        {isEditMode ? (
                          <ResumeForm
                            data={tempResumeData}
                            onUpdate={(updatedData) => {
                              setTempResumeData(updatedData);
                            }}
                            language="en"
                            country="us"
                            preferences={{}}
                            selectedTemplate={selectedTemplate}
                            currentUserId={user?.uid}
                            currentResumeId={resumeId}
                          />
                        ) : (
                          <ResumePreview
                            data={enhancedResumeData}
                            template={selectedTemplate}
                            customColors={customColors}
                            config={defaultConfig}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Sticky Bottom Navigation - Mobile Only */}
      {currentStep === 3 && enhancedResumeData && (
        <>
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
            <div className="flex justify-around items-center py-3 px-2">
              {/* Edit */}
              <button
                onClick={toggleEditMode}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isEditMode
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Edit size={20} />
                <span className="text-xs font-medium">{isEditMode ? 'Save' : 'Edit'}</span>
              </button>

              {/* Download */}
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-[#0B1F3B] hover:text-[#0B1F3B] disabled:text-gray-400"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span className="text-xs font-medium">Generating</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span className="text-xs font-medium">Download</span>
                  </>
                )}
              </button>

              {/* Template */}
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-[#00C4B3] hover:text-[#0B1F3B]"
              >
                <Palette size={20} />
                <span className="text-xs font-medium">Template</span>
              </button>

              {/* Colors */}
              <button
                onClick={() => setShowColorCustomizer(true)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-[#00C4B3] hover:text-[#0B1F3B]"
              >
                <Palette size={20} />
                <span className="text-xs font-medium">Colors</span>
              </button>

              {/* Save to Account */}
              {user && (
                <button
                  onClick={() => {
                    if (isSavingToAccount) return;
                    openSaveDialog();
                  }}
                  disabled={isSavingToAccount}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-[#0B1F3B] hover:text-[#0B1F3B] disabled:text-gray-400"
                >
                  <Save size={20} />
                  <span className="text-xs font-medium">Save</span>
                </button>
              )}

              {/* Start Over */}
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setJobDescription('');
                  setUploadedResume(null);
                  setParsedResumeData(null);
                  setEnhancedResumeData(null);
                  setMatchAnalysis(null);
                  setIsAnalyzing(false);
                  setIsProcessing(false);
                  setIsGeneratingPdf(false);
                  setIsSavingToAccount(false);
                  setIsEditMode(false);
                  setTempResumeData(null);
                  setEditingSection(null);
                  setDetectedKeywords([]);
                  setEnhancementSummary(null);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              >
                <RotateCcw size={20} />
                <span className="text-xs font-medium">Start Over</span>
              </button>
            </div>
          </div>

          {/* Interview Cheatsheet CTA - After Resume is Generated */}
          <div className="mt-8 px-4 sm:px-0">
            <InterviewCheatsheetCTA
              jobDescription={jobDescription}
              resumeData={enhancedResumeData}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showTemplateSelector && (
        <TemplateSelector
          onClose={() => setShowTemplateSelector(false)}
          template={selectedTemplate}
          setTemplate={setSelectedTemplate}
          stayOnPage={true}
          hideJobSpecificTab={true}
          isPremium={user?.isPremium || false}
        />
      )}

      {showColorCustomizer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowColorCustomizer(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="color-customizer-title"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
              <h2 id="color-customizer-title" className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Palette size={20} className="text-[#0B1F3B]" />
                Customize Colors
              </h2>
              <button
                onClick={() => setShowColorCustomizer(false)}
                className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close color customizer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
              <ColorCustomizer
                template={selectedTemplate}
                colors={customColors}
                onChange={(colorKey, color) => {
                  setCustomColors(prev => ({
                    ...prev,
                    [colorKey]: color
                  }));
                }}
                onDone={() => setShowColorCustomizer(false)}
              />
            </div>
          </motion.div>
        </div>
      )}

      {showPdfModal && pdfPreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowPdfModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-preview-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
              <h2 id="pdf-preview-title" className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <Eye size={20} className="text-[#0B1F3B]" />
                Resume Preview
              </h2>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close PDF preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-2 sm:p-6 overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <div className="bg-gray-50 rounded-lg p-1 mb-4 flex justify-center">
                <iframe
                  src={pdfPreviewUrl}
                  className="border-0 rounded-lg bg-white w-full"
                  style={{
                    maxWidth: '794px',
                    height: '70vh',
                    minHeight: '400px'
                  }}
                  title="Resume PDF Preview"
                  aria-label="PDF document preview"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors font-semibold min-h-[44px]"
                >
                  Close
                </button>
                <a
                  href={pdfPreviewUrl}
                  download="enhanced-resume.pdf"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white px-5 sm:px-6 py-3 sm:py-2.5 rounded-lg hover:from-[#0B1F3B] hover:to-[#00C4B3]/90 active:from-[#0B1F3B] active:to-[#0B1F3B] transition-colors flex items-center justify-center gap-2 font-bold shadow-lg min-h-[44px]"
                >
                  <Download size={20} />
                  Download PDF
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPremiumPdfModal && (
        <PremiumPdfPreview
          isOpen={showPremiumPdfModal}
          onClose={() => setShowPremiumPdfModal(false)}
          pdfPreviewUrl={pdfPreviewUrl}
          pdfPreviewBlob={pdfPreviewBlob}
          isPremium={isPremium}
          user={user}
          handleUpgradeClick={handleUpgradeClick}
          formatPrice={formatPrice}
          monthlyPrice={pricing.monthly}
          basicPrice={pricing.basic}
          currency={currency}
          event={event}
          toast={toast}
          resumeName={currentResumeName}
          candidateName={enhancedResumeData?.name || tempResumeData?.name}
        />
      )}



      {/* Enterprise Upgrade Modal */}


      {/* Quota Limit Modal */}
      <QuotaLimitModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        quotaType={quotaInfo?.quotaType}
        currentCount={quotaInfo?.currentCount}
        limit={quotaInfo?.limit}
        onUpgrade={() => {
          setShowQuotaModal(false);
          router.push('/enterprise/checkout');
        }}
      />

      {showHelpModal && (
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}


      {isProcessing && (
        <ProgressOverlay
          message={parsedResumeData
            ? "Analyzing your resume and tailoring it to the job requirements..."
            : "Creating a professional resume template based on the job description..."}
          subMessage={parsedResumeData
            ? "Optimizing your experience and skills for this specific role..."
            : "This may take a few moments..."}
        />
      )}

      {/* Enhanced Help Button - Hidden on Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelpModal(true)}
        className="hidden sm:block fixed bottom-4 right-4 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
      >
        <HelpCircle size={20} />
      </motion.button>

      {/* Floating Edit Mode Toggle - Hidden on Mobile */}
      {isEditMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleEditMode}
          className="hidden sm:block fixed bottom-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        >
          <Check size={20} />
        </motion.button>
      )}

      {/* JD History/Viewer Modal */}
      <AnimatePresence>
        {showJDHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowJDHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white p-4 sm:p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck size={24} />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold">Job Description</h3>
                      <p className="text-sm text-white/80 mt-1">
                        For: {currentResumeName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowJDHistory(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content - Fully Scrollable with no height limits */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase size={20} className="text-gray-600" />
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">Full Job Description</h4>
                  </div>
                  <div className="whitespace-pre-wrap text-sm sm:text-base text-gray-700 leading-relaxed space-y-3">
                    {jobDescription}
                  </div>
                </div>

                {/* Keyword Summary */}
                {detectedKeywords && detectedKeywords.length > 0 && (
                  <div className="mt-4 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={20} className="text-green-600" />
                      <h4 className="font-semibold text-green-800 text-base sm:text-lg">Detected Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detectedKeywords.slice(0, 3).map((group, idx) => (
                        <div key={idx} className="flex flex-wrap gap-1">
                          {group.keywords.slice(0, 5).map((keyword, kIdx) => (
                            <span
                              key={kIdx}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{jobDescription.length}</span> characters
                </div>
                <button
                  onClick={() => setShowJDHistory(false)}
                  className="px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#0B1F3B]/90 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowSaveDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5">
              <h2 id="save-dialog-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Save size={24} className="text-[#0B1F3B]" />
                Save Resume
              </h2>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Close save dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="resume-name-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Name
                </label>
                <input
                  id="resume-name-input"
                  type="text"
                  value={resumeNameInput}
                  onChange={(e) => {
                    setResumeNameInput(e.target.value);
                    setSaveDialogError("");
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSavingToAccount) {
                      saveResumeWithCustomName();
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent transition-all"
                  placeholder="e.g., Software Engineer at Google"
                  autoFocus
                />
                {saveDialogError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {saveDialogError}
                  </p>
                )}
              </div>

              <div className="bg-[#0B1F3B]/5 border border-[#00C4B3]/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-[#0F172A]">
                  💡 <strong>Tip:</strong> Give your resume a descriptive name to easily identify it later.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSavingToAccount}
                >
                  Cancel
                </button>
                <button
                  onClick={saveResumeWithCustomName}
                  disabled={isSavingToAccount || !resumeNameInput.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white rounded-lg hover:from-[#0B1F3B] hover:to-[#00C4B3]/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingToAccount ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ChromeExtensionPromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />

      {/* Profile Guard Modal */}
      <ProfileGuardModal />

    </div>
  );
}