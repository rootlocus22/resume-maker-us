'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import optimizeResumeService from '../lib/optimizeResumeService';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Star, Zap, Target, Award, TrendingUp, Eye, Download, ArrowRight, ArrowLeft, X, Crown, Lock, Upload, Edit2 } from 'lucide-react';
import { allTemplates } from '../lib/allTemplates';
import ResumeSlideshowModal from '../components/ResumeSlideshowModal';
import ResumePreview from '../components/ResumePreview';
import { originalTemplates } from '../lib/templates';
import { atsFriendlyTemplates } from '../lib/atsFriendlyTemplates';
import { saveWorkingResume } from '../lib/storage';

export default function OptimizedResumePreview({
  originalData,
  atsResult,
  onUpgradeClick,
  isPremium = false,
  isBasicPlan = false,
  user = null
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('optimized');
  const [showSlideshowModal, setShowSlideshowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentOptimizedTemplate, setCurrentOptimizedTemplate] = useState(0);
  const [optimizedData, setOptimizedData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [scoreImprovement, setScoreImprovement] = useState(null);


  // Check if user has access to full resume preview
  // Anonymous users, free users, and basic plan users get limited access
  const hasFullAccess = isPremium || isBasicPlan;

  // Template navigation functions
  const goToPreviousTemplate = () => {
    setCurrentOptimizedTemplate((prev) =>
      prev > 0 ? prev - 1 : atsTemplates.length - 1
    );
  };

  const goToNextTemplate = () => {
    setCurrentOptimizedTemplate((prev) =>
      prev < atsTemplates.length - 1 ? prev + 1 : 0
    );
  };

  // Fetch optimized resume data from API
  useEffect(() => {
    console.log('🔍 OptimizedResumePreview useEffect triggered:', {
      hasOriginalData: !!originalData,
      hasAtsResult: !!atsResult,
      hasOptimizedData: !!optimizedData,
      isOptimizing
    });
    
    if (originalData && atsResult && !optimizedData && !isOptimizing) {
      console.log('🔧 Fetching optimized resume...');
      fetchOptimizedResume();
    } else {
      console.log('⚠️ Skipping API call due to conditions not met');
    }
  }, [originalData, atsResult]);

  const fetchOptimizedResume = async () => {
    // Prevent duplicate calls if already optimizing
    if (isOptimizing) {
      console.log('⚠️ Optimize resume call already in progress, skipping duplicate call');
      return;
    }
    
    setOptimizationError(null);
    
    try {
      const result = await optimizeResumeService.optimizeResume(
        originalData, 
        atsResult,
        // Loading start callback
        () => {
          console.log('🔄 Starting optimization loading...');
          setIsOptimizing(true);
        },
        // Loading end callback
        () => {
          console.log('✅ Optimization loading completed');
          setIsOptimizing(false);
        }
      );
      
      if (result) {
        setOptimizedData(result.optimizedResume);
        setImprovements(result.improvements || []);
        setScoreImprovement(result.estimatedScoreImprovement);
      } else {
        console.log('⚠️ Optimize resume request already in progress, skipping duplicate call');
      }
      
    } catch (error) {
      console.error('Error optimizing resume:', error);
      setOptimizationError(error.message);
      // Fallback to original data
      setOptimizedData(originalData);
    }
  };

  // Handle preview full resume with slideshow modal (shows optimized resume in multiple ATS templates)
  const handlePreviewFullResume = () => {
    setShowSlideshowModal(true);
  };

  // Transform data to match ResumeForm expectations
  const transformSkillsForResumePreview = (data) => {
    if (!data) return data;

    const transformedData = { ...data };

    // Handle personal info mapping - API might return personal object but ResumeForm expects top-level fields
    if (transformedData.personal && typeof transformedData.personal === 'object') {
      console.log('🔧 Mapping personal fields from personal object to top-level');
      // Map personal object fields to top-level fields
      if (transformedData.personal.name) transformedData.name = transformedData.personal.name;
      if (transformedData.personal.email) transformedData.email = transformedData.personal.email;
      if (transformedData.personal.phone) transformedData.phone = transformedData.personal.phone;
      if (transformedData.personal.location) transformedData.address = transformedData.personal.location;
      if (transformedData.personal.linkedin) transformedData.linkedin = transformedData.personal.linkedin;
      if (transformedData.personal.website) transformedData.portfolio = transformedData.personal.website;
    }

    // Ensure jobTitle exists - check multiple possible field names
    if (!transformedData.jobTitle) {
      if (transformedData.personal?.jobTitle) {
        transformedData.jobTitle = transformedData.personal.jobTitle;
      } else if (transformedData.personal?.title) {
        transformedData.jobTitle = transformedData.personal.title;
      } else if (transformedData.title) {
        transformedData.jobTitle = transformedData.title;
      } else if (transformedData.position) {
        transformedData.jobTitle = transformedData.position;
      }
    }

    console.log('🎯 After personal mapping:', {
      name: transformedData.name,
      jobTitle: transformedData.jobTitle,
      email: transformedData.email,
      phone: transformedData.phone,
      hasPersonalObject: !!transformedData.personal
    });

    // Transform skills to expected format
    if (transformedData.skills && Array.isArray(transformedData.skills)) {
      transformedData.skills = transformedData.skills.map(skill => {
        // If skill is already an object with name property, keep it
        if (typeof skill === 'object' && skill.name) {
          return skill;
        }
        // If skill is a string, convert to object format
        if (typeof skill === 'string') {
          return { name: skill };
        }
        // If skill is an object but has different property name, try to map it
        if (typeof skill === 'object' && (skill.skill || skill.title)) {
          return { name: skill.skill || skill.title };
        }
        // Fallback
        return { name: String(skill) };
      });
    }

    // Transform experience descriptions to strings if they're arrays
    if (transformedData.experience && Array.isArray(transformedData.experience)) {
      transformedData.experience = transformedData.experience.map(exp => {
        const transformedExp = { ...exp };
        
        // Map experience field names - API might use different names
        if (!transformedExp.jobTitle && (transformedExp.title || transformedExp.position)) {
          transformedExp.jobTitle = transformedExp.title || transformedExp.position;
        }
        if (!transformedExp.company && (transformedExp.organization || transformedExp.employer)) {
          transformedExp.company = transformedExp.organization || transformedExp.employer;
        }
        
        // Ensure all string fields are actually strings and handle undefined
        ['jobTitle', 'company', 'description', 'location'].forEach(field => {
          if (transformedExp[field] !== undefined && transformedExp[field] !== null) {
            if (Array.isArray(transformedExp[field])) {
              // If it's an array, join with newlines
              transformedExp[field] = transformedExp[field].join('\n');
            } else if (typeof transformedExp[field] !== 'string') {
              // If it's not a string, convert it
              transformedExp[field] = String(transformedExp[field]);
            }
          } else {
            // Set empty string for undefined/null fields
            transformedExp[field] = '';
          }
        });
        
        // Ensure dates are strings and handle undefined
        ['startDate', 'endDate'].forEach(field => {
          if (transformedExp[field] !== undefined && transformedExp[field] !== null) {
            transformedExp[field] = String(transformedExp[field]);
          } else {
            transformedExp[field] = '';
          }
        });
        
        return transformedExp;
      });
    }

    // Transform education fields to strings
    if (transformedData.education && Array.isArray(transformedData.education)) {
      transformedData.education = transformedData.education.map(edu => {
        const transformedEdu = { ...edu };
        
        // Ensure all string fields are actually strings and handle undefined
        ['degree', 'institution', 'school', 'field', 'description'].forEach(field => {
          if (transformedEdu[field] !== undefined && transformedEdu[field] !== null) {
            if (Array.isArray(transformedEdu[field])) {
              transformedEdu[field] = transformedEdu[field].join('\n');
            } else if (typeof transformedEdu[field] !== 'string') {
              transformedEdu[field] = String(transformedEdu[field]);
            }
          } else {
            transformedEdu[field] = '';
          }
        });
        
        // Ensure dates are strings and handle undefined
        ['startDate', 'endDate', 'graduationDate'].forEach(field => {
          if (transformedEdu[field] !== undefined && transformedEdu[field] !== null) {
            transformedEdu[field] = String(transformedEdu[field]);
          } else {
            transformedEdu[field] = '';
          }
        });
        
        return transformedEdu;
      });
    }

    // Ensure top-level string fields are strings and handle undefined/null values
    ['name', 'email', 'phone', 'jobTitle', 'summary', 'address', 'linkedin', 'portfolio'].forEach(field => {
      if (transformedData[field] !== undefined && transformedData[field] !== null) {
        if (Array.isArray(transformedData[field])) {
          transformedData[field] = transformedData[field].join(' ');
        } else if (typeof transformedData[field] !== 'string') {
          transformedData[field] = String(transformedData[field]);
        }
      } else {
        // Set empty string for undefined/null fields to prevent "undefined" text
        transformedData[field] = '';
      }
    });

    // Handle other potential undefined fields
    ['website', 'github', 'location'].forEach(field => {
      if (transformedData[field] === undefined || transformedData[field] === null) {
        transformedData[field] = '';
      } else if (transformedData[field] && typeof transformedData[field] !== 'string') {
        transformedData[field] = String(transformedData[field]);
      }
    });

    // Ensure arrays exist and are properly initialized
    ['experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'awards', 'customSections'].forEach(field => {
      if (!Array.isArray(transformedData[field])) {
        transformedData[field] = [];
      }
    });

    return transformedData;
  };

  // Memoize the transformed data to prevent unnecessary re-renders
  const originalTransformedData = useMemo(() => {
    if (!originalData) {
      return {
        name: "Your Name",
        jobTitle: "Your Job Title",
        email: "your.email@example.com",
        phone: "(555) 123-4567",
        address: "Your Location",
        summary: "Your professional summary...",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        achievements: []
      };
    }
    return transformSkillsForResumePreview(originalData);
  }, [originalData]);

  const optimizedTransformedData = useMemo(() => {
    const dataToTransform = optimizedData || originalData;
    if (!dataToTransform) {
      return {
        name: "Your Name",
        jobTitle: "Your Job Title",
        email: "your.email@example.com",
        phone: "(555) 123-4567",
        address: "Your Location",
        summary: "Your professional summary...",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        achievements: []
      };
    }
    return transformSkillsForResumePreview(dataToTransform);
  }, [optimizedData, originalData]);

  // Blur Overlay Component for Non-Premium Users
  const BlurOverlay = ({ onUpgrade, className = "" }) => (
    <div className={`absolute inset-0 bg-gradient-to-t from-white/99 via-white/90 to-transparent backdrop-blur-md flex items-end justify-center p-3 sm:p-6 ${className}`}>
                <div className="bg-white/98 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-300 max-w-sm text-center w-full mx-2 sm:mx-0">
            <div className="mb-3 sm:mb-4">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <Lock className="text-white sm:w-5 sm:h-5" size={16} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                Unlock ATS Optimization
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Get access to AI-optimized resumes with improved ATS scores and unlimited downloads.
              </p>
            </div>
            <button
              onClick={() => onUpgrade('basic', 'ats-preview-blur')}
              className="w-full bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-accent-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Crown size={16} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Upgrade to Premium</span>
            </button>
          </div>
    </div>
  );

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    // Check if user has access to download
    if (!hasFullAccess) {
      onUpgradeClick('basic', 'ats-download');
      return;
    }

    setIsDownloading(true);
    try {
      const rawData = activeTab === 'optimized' ? (optimizedData || originalData) : originalData;
      const dataToUse = transformSkillsForResumePreview(rawData);
      const templateToUse = activeTab === 'optimized' ? (atsTemplates[0]?.id || 'classic') : 'classic'; // Use first ATS template for download

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataToUse,
          template: templateToUse,
          customColors: {},
          preferences: {},
          language: 'en',
          country: 'us',
          isPremium: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const templateName = activeTab === 'optimized' ? atsTemplates[currentOptimizedTemplate]?.name?.toLowerCase().replace(/\s+/g, '-') || 'optimized' : 'original';
      a.download = `${templateName}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);

      const errorMessage = error.message.includes('Failed to generate PDF')
        ? 'Unable to generate PDF. Please check your resume data and try again.'
        : 'Download failed. Please check your internet connection and try again.';

      if (typeof window !== 'undefined' && window.alert) {
        alert(errorMessage);
      } else {
        console.error('PDF Download Error:', errorMessage);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Edit Resume - Navigate to resume-builder with optimized data
  const handleEditResume = async () => {
    try {
      const dataToEdit = activeTab === 'optimized' ? (optimizedData || originalData) : originalData;
      const currentTemplate = activeTab === 'optimized' ? atsTemplates[currentOptimizedTemplate] : null;
      
      if (!dataToEdit) {
        console.error('No resume data available for editing');
        return;
      }

      // Transform the data to ensure it matches the resume-builder's expected format
      const transformedData = transformSkillsForResumePreview(dataToEdit);
      const templateId = currentTemplate?.id || 'classic';
      
      // Create ATS-specific data package
      const atsDataPackage = {
        resumeData: transformedData,
        template: templateId,
        customColors: {},
        preferences: {},
        language: 'en',
        country: 'us',
        metadata: {
          source: 'ats-score-checker',
          activeTab: activeTab,
          atsOptimized: activeTab === 'optimized',
          originalScore: atsResult?.overallScore || 0,
          optimizedScore: activeTab === 'optimized' ? improvementScore : null,
          templateName: currentTemplate?.name || 'Classic',
          timestamp: Date.now()
        }
      };
      
      console.log('🎯 Preparing ATS data for resume-builder:', {
        templateId,
        dataKeys: Object.keys(transformedData),
        hasName: !!transformedData.name,
        hasJobTitle: !!transformedData.jobTitle,
        hasExperience: !!transformedData.experience?.length,
        hasSkills: !!transformedData.skills?.length,
        activeTab,
        personalInfo: {
          name: transformedData.name,
          jobTitle: transformedData.jobTitle,
          email: transformedData.email,
          phone: transformedData.phone
        },
        atsDataPackage
      });
      
      // Store ATS-specific data in localStorage
      if (typeof window !== 'undefined') {
        const timestamp = Date.now();
        
        // Store data
        localStorage.setItem('ats_resume_data', JSON.stringify(atsDataPackage));
        localStorage.setItem('ats_data_timestamp', timestamp.toString());
        
        console.log('💾 STORING ATS DATA:', {
          timestamp,
          templateId,
          resumeDataName: atsDataPackage.resumeData?.name,
          resumeDataKeys: Object.keys(atsDataPackage.resumeData || {}),
          fullPackage: atsDataPackage
        });
        
        // Double-check storage worked
        const stored = localStorage.getItem('ats_resume_data');
        console.log('✅ STORAGE VERIFICATION:', {
          stored: !!stored,
          length: stored?.length,
          canParse: !!stored && (() => {
            try { JSON.parse(stored); return true; } catch { return false; }
          })()
        });
      }

      // Navigate to resume-builder with template and source parameters
      const templateParam = `?template=${templateId}&source=ats`;
      router.push(`/resume-builder${templateParam}`);
      
    } catch (error) {
      console.error('Error preparing resume for editing:', error);
      // Fallback - just navigate without specific template
      router.push('/resume-builder');
    }
  };

  // Calculate improvement score from API response or fallback
  const improvementScore = useMemo(() => {
    if (scoreImprovement) {
      return scoreImprovement.estimatedScore;
    }
    if (!atsResult) return 0;
    const currentScore = atsResult.overallScore || 0;
    return Math.min(100, currentScore + 25); // Fallback estimation
  }, [scoreImprovement, atsResult]);

  // Get ATS-friendly templates from atsFriendlyTemplates
  // Single-column templates first (better ATS compatibility), then double-column templates
  const atsTemplates = useMemo(() => {
    const atsTemplateIds = [
      // Single-column layouts (better ATS parsing) - shown first
      'ats_classic_professional', // Professional classic format (single column)
      'ats_modern_clean', // Clean modern design (single column)
      'ats_classic_standard', // Classic standard format (single column)
      'ats_modern_executive', // Modern executive (single column)
      'ats_c_level_executive', // Executive level template (single column)
      'ats_finance_analyst', // Finance-focused template (single column)
      'ats_entry_level_standard', // Entry level standard (single column)
      // Double-column layouts - shown last
      'ats_two_column_executive', // Executive two-column layout
      'ats_two_column_professional', // Professional two-column layout
      'ats_tech_engineer', // Tech-focused template (two column)
      'ats_marketing_specialist', // Marketing template (two column)
      'ats_data_scientist' // Data science template (two column)
    ];



    const filteredTemplates = atsTemplateIds
      .filter(id => atsFriendlyTemplates[id])
      .map(id => {
        const template = atsFriendlyTemplates[id];
        return {
          id,
          name: template.name,
          description: getTemplateDescription(id),
          score: scoreImprovement?.estimatedScore || atsResult?.overallScore || 85, // Use optimized score if available
          features: getTemplateFeatures(id),
          preview: template.previewImage || `/templates/previews/${id}.png`,
          template: template
        };
      });
    return filteredTemplates;
  }, [atsResult, scoreImprovement]);

  // Helper functions for template metadata
  function getTemplateDescription(templateId) {
    const descriptions = {
      'ats_classic_professional': 'Classic professional format with proven ATS compatibility and clean layout',
      'ats_modern_clean': 'Modern clean design with excellent readability and ATS optimization',
      'ats_two_column_professional': 'Professional two-column layout balancing style and ATS compatibility',
      'ats_tech_engineer': 'Tech-focused template optimized for engineering and technical roles',
      'ats_c_level_executive': 'C-level executive template with professional styling and leadership focus',
      'ats_finance_analyst': 'Finance-focused template with clean structure for analytical roles',
      'ats_marketing_specialist': 'Marketing template with creative elements while maintaining ATS compatibility',
      'ats_data_scientist': 'Data science template with technical focus and analytical presentation',
      'ats_two_column_executive': 'Executive two-column layout with professional styling and leadership emphasis',
      'ats_professional_profile': 'Professional profile template with comprehensive sections and ATS optimization'
    };
    return descriptions[templateId] || 'Professional ATS-optimized template from our specialized collection';
  }



  function getTemplateFeatures(templateId) {
    const features = {
      'ats_classic_professional': ['Classic layout', 'Professional styling', 'ATS optimized', 'Clean structure'],
      'ats_modern_clean': ['Modern design', 'Clean typography', 'High readability', 'ATS compliant'],
      'ats_two_column_professional': ['Two-column layout', 'Professional balance', 'Space efficient', 'ATS friendly'],
      'ats_tech_engineer': ['Tech-focused', 'Engineering optimized', 'Technical emphasis', 'Industry standard'],
      'ats_c_level_executive': ['C-level executive', 'Leadership focus', 'Professional styling', 'Senior positions'],
      'ats_finance_analyst': ['Finance focused', 'Analytical layout', 'Clean structure', 'Quantitative emphasis'],
      'ats_marketing_specialist': ['Marketing oriented', 'Creative elements', 'ATS compatible', 'Brand focused'],
      'ats_data_scientist': ['Data science focus', 'Technical presentation', 'Analytical skills', 'Industry specific'],
      'ats_two_column_executive': ['Executive layout', 'Two-column design', 'Leadership styling', 'Senior executive'],
      'ats_professional_profile': ['Comprehensive sections', 'Professional profile', 'ATS optimized', 'Complete presentation']
    };
    return features[templateId] || ['ATS optimized', 'Professional design', 'Industry focused', 'Clean layout'];
  }

  

  return (
    <div className="ats-score-checker space-y-4 sm:space-y-6">
      {/* Score Comparison */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">ATS Score Improvement</h3>
          {isOptimizing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
              <span className="text-xs sm:text-sm text-primary">Optimizing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">{atsResult?.overallScore || 0}%</div>
                <div className="text-xs text-gray-500">Current</div>
              </div>
              <ArrowRight className="text-gray-400 sm:w-5 sm:h-5" size={16} />
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{improvementScore}%</div>
                <div className="text-xs sm:text-sm text-green-600">Optimized</div>
              </div>
            </div>
          )}
        </div>
        
        {optimizationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500 sm:w-4 sm:h-4" size={14} />
              <span className="text-xs sm:text-sm text-red-600">Optimization failed: {optimizationError}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-white rounded-lg p-2 sm:p-3">
            <Target className="text-accent mx-auto mb-2 w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-xs sm:text-sm font-medium text-gray-900">Keywords Added</div>
            <div className="text-sm sm:text-lg font-bold text-primary">
              {(() => {
                const keywordImprovement = improvements.find(i => i.type === 'keywords');
                if (keywordImprovement) {
                  // Use count property if available, otherwise extract from description
                  if (keywordImprovement.count) return keywordImprovement.count;
                  const match = keywordImprovement.description.match(/(\d+)/);
                  return match ? match[1] : '?';
                }
                return '0';
              })()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 sm:p-3">
            <Zap className="text-green-500 mx-auto mb-2 w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-xs sm:text-sm font-medium text-gray-900">Achievements Quantified</div>
            <div className="text-sm sm:text-lg font-bold text-green-600">
              {(() => {
                const achievementImprovement = improvements.find(i => i.type === 'achievements' || i.type === 'experience');
                if (achievementImprovement) {
                  // Extract number from description like "Quantified 14 achievements with specific metrics"
                  const match = achievementImprovement.description.match(/(\d+)/);
                  return match ? match[1] : achievementImprovement.count || '?';
                }
                return '0';
              })()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 sm:p-3">
            <Award className="text-purple-500 mx-auto mb-2 w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-xs sm:text-sm font-medium text-gray-900">Skills Added</div>
            <div className="text-sm sm:text-lg font-bold text-purple-600">
              {(() => {
                const skillsImprovement = improvements.find(i => i.type === 'skills');
                if (skillsImprovement) {
                  // Use count property if available, otherwise extract from description
                  if (skillsImprovement.count) return skillsImprovement.count;
                  const match = skillsImprovement.description.match(/(\d+)/);
                  return match ? match[1] : '?';
                }
                return '0';
              })()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 sm:p-3">
            <CheckCircle className="text-orange-500 mx-auto mb-2 w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-xs sm:text-sm font-medium text-gray-900">Total Improvements</div>
            <div className="text-sm sm:text-lg font-bold text-orange-600">
              {improvements.length}
            </div>
          </div>
        </div>

        {/* Show improvements list */}
        {improvements.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Applied Improvements:</h4>
            <ul className="space-y-2">
              {improvements.map((improvement, index) => (
                <li key={index} className="text-xs sm:text-sm text-gray-600 flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-0.5" />
                  <span className="leading-relaxed">{improvement.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ATS Template Slideshow CTA */}

      {/* Resume Preview Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Premium Access Notice */}
        {!hasFullAccess && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200 px-3 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Lock className="text-orange-600 sm:w-4 sm:h-4" size={14} />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-orange-800 font-medium">
                  Upgrade to Premium for ATS optimization
                </p>
                <p className="text-xs text-orange-700">
                  Unlock AI-optimized resumes, unlimited downloads, and advanced ATS compatibility features.
                </p>
              </div>
              <button
                onClick={() => onUpgradeClick('basic', 'ats-banner')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:from-orange-600 hover:to-red-600 transition-colors self-start sm:self-auto"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
        {/* Tab Navigation - Original vs ATS Optimized */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'original'
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('original')}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span>Original Resume</span>
              </div>
            </button>
            <button
              className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'optimized'
                  ? 'text-primary border-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('optimized')}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span>ATS Optimized</span>
                <Star className="text-green-500 sm:w-3.5 sm:h-3.5" size={12} />
                {!hasFullAccess && <Lock className="text-orange-500 sm:w-3 sm:h-3" size={10} />}
              </div>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === 'original' ? (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <AlertCircle className="text-orange-500 sm:w-4 sm:h-4" size={14} />
                <span className="text-xs sm:text-sm text-orange-600">
                  Your Original Uploaded Resume - ATS Score: {atsResult?.overallScore || 0}%
                </span>
              </div>
              <div className="bg-white  rounded-lg shadow-sm">
                <ResumePreview
                  data={originalTransformedData}
                  template="classic"
                  customColors={{}}
                  preferences={{}}
                  language="en"
                  country="us"
                  isPremium={false}
                  manualScale={0.8}
                />
              </div>

              {/* Edit Resume Button for Original Resume */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={handleEditResume}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-accent hover:bg-accent-600 text-white shadow-md hover:shadow-lg"
                >
                  <Edit2 size={16} />
                  <span className="text-sm">
                    Edit {activeTab === 'optimized' ? 'ATS-Optimized' : 'Original'} Resume
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                    <span className="text-xs sm:text-sm text-primary">
                      AI is optimizing your resume for ATS compatibility...
                    </span>
                  </>
                ) : optimizationError ? (
                  <>
                    <AlertCircle className="text-red-500 sm:w-4 sm:h-4" size={14} />
                    <span className="text-xs sm:text-sm text-red-600">
                      Optimization failed - showing original resume
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="text-green-500 sm:w-4 sm:h-4" size={14} />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-green-600">
                        ATS-Optimized Resume - Estimated Score: {improvementScore}%
                      </span>
                      {scoreImprovement && (
                        <span className="text-xs text-gray-500 mt-1">
                          +{scoreImprovement.improvement} points improvement
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {isOptimizing ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-sm sm:text-base text-gray-600">AI is optimizing your resume...</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Template Navigation Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <button
                      onClick={goToPreviousTemplate}
                      disabled={atsTemplates.length <= 1}
                      className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <div className="text-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Star className="text-green-500 mx-auto sm:mx-0 sm:w-3.5 sm:h-3.5" size={12} />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {atsTemplates[currentOptimizedTemplate]?.name || 'Template'}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {atsTemplates[currentOptimizedTemplate]?.score}% ATS Score
                          {scoreImprovement && (
                            <span className="text-xs text-gray-500 ml-1">
                              (+{scoreImprovement.improvement})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentOptimizedTemplate + 1} of {atsTemplates.length} templates
                      </div>
                    </div>
                    <button
                      onClick={goToNextTemplate}
                      disabled={atsTemplates.length <= 1}
                      className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Resume Preview */}
                  <div className="bg-white  rounded-lg shadow-sm relative overflow-hidden">
                    <ResumePreview
                      data={optimizedTransformedData}
                      template={atsTemplates[currentOptimizedTemplate]?.id || 'classic'}
                      customColors={{}}
                      preferences={{}}
                    />
                    {!hasFullAccess && (
                      <BlurOverlay onUpgrade={onUpgradeClick} className="top-1/2" />
                    )}
                  </div>

                  {/* Edit Resume Button for Optimized Resume */}
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={handleEditResume}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-accent hover:bg-accent-600 text-white shadow-md hover:shadow-lg"
                    >
                      <Edit2 size={16} />
                      <span className="text-sm">
                        Edit {activeTab === 'optimized' ? 'ATS-Optimized' : 'Original'} Resume
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Navigate to Resume Builders */}
      <div className="space-y-3 sm:space-y-4">
        {/* Explanatory Text */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Get better results with our specialized resume builders
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* JD Based Resume Button */}
          <button
            onClick={() => router.push('/job-description-resume-builder')}
            className="bg-accent hover:bg-accent-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[80px] sm:min-h-[100px]"
          >
            <Target size={20} className="sm:w-6 sm:h-6" />
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg">JD Based Resume</div>
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                Tailored for specific job descriptions with optimized keywords
              </div>
            </div>
          </button>

          {/* Upload Resume Button */}
          <button
            onClick={() => router.push('/upload-resume')}
            className="bg-gradient-to-r from-primary to-accent text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:from-gray-900 hover:to-accent-700 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[80px] sm:min-h-[100px]"
          >
            <Upload size={20} className="sm:w-6 sm:h-6" />
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg">Upload Resume</div>
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                Upload your existing resume for AI-powered improvements
              </div>
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Both options provide ATS optimization, keyword suggestions, and professional templates
          </p>
        </div>
      </div>

      {/* ATS Template Slideshow Modal - Shows optimized resume in multiple ATS-friendly templates */}
      <ResumeSlideshowModal
        isOpen={showSlideshowModal}
        onClose={() => setShowSlideshowModal(false)}
        resumeData={optimizedTransformedData}
        customColors={{}}
        preferences={{}}
        isPremium={hasFullAccess}
        upgradeCTA={onUpgradeClick}
        downloadResume={handleDownloadPDF}
        user={null}
        atsMode={true}
        atsTemplates={atsTemplates}
      />
    </div>
  );
}
