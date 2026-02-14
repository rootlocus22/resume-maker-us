'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ResumePreview from '../../components/ResumePreview';
import { useAuth } from '../../context/AuthContext';
import { templates } from '../../lib/templates';
import PromotionalBanner from '../../components/PromotionalBanner';
import { Edit2, Save, X, Plus, Trash2, Check, AlertCircle, Lock, FileText, BarChart2, Mail, Layout, CheckCircle, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { event } from '../../lib/gtag';
import HostedResumeSkeleton from '../../components/HostedResumeSkeleton';
import ModernAnalysisDisplay from '../../ats-score-checker/ModernAnalysisDisplay';
import CoverLetterPreview from '../../components/CoverLetterPreview';
import OnePagerPreview from '../../components/OnePagerPreview';
import { coverLetterTemplates } from '../../lib/coverLetterTemplate';
import { onePagerTemplates } from '../../lib/onePagerTemplates';
import ResumeEditForm from '../../components/ResumeEditForm';
import ProgressOverlay from '../../components/ProgressOverlay';

export default function HostedResumePage() {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 360 Degree Feature State
  const [activeTab, setActiveTab] = useState('resume');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
  const [onePagerTemplate, setOnePagerTemplate] = useState('classic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [progressOverlay, setProgressOverlay] = useState({ isVisible: false, type: 'download' });

  // Auto-generate ATS report if missing when tab is active
  useEffect(() => {
    if (activeTab === 'ats' && !resumeData.analysisResult && (resumeData.atsScore === undefined || resumeData.atsScore === null) && !isAnalyzing) {
      generateAtsReport();
    }
  }, [activeTab]);

  const generateAtsReport = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // Create a JSON file from resumeData
      const jsonString = JSON.stringify(resumeData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, 'resume_data.json');
      formData.append('jobDescription', ''); // General analysis

      const response = await fetch('/api/ats-checker', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate ATS report');
      }

      const result = await response.json();

      setResumeData(prev => ({
        ...prev,
        analysisResult: result,
        atsScore: result.overallScore
      }));

      // Cache the result to the source resume
      try {
        await fetch('/api/hosted-resume/save-ats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostedId,
            analysisResult: result,
            atsScore: result.overallScore
          })
        });
      } catch (saveError) {
        console.error('Failed to cache ATS report:', saveError);
      }

      toast.success('ATS Report Generated successfully!');
    } catch (error) {
      console.error('ATS Generation Error:', error);
      toast.error('Failed to generate ATS report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  const [coverLetterTemplate, setCoverLetterTemplate] = useState('sleek');
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [editedCoverLetterData, setEditedCoverLetterData] = useState(null);
  const [showCoverLetterTemplateSelector, setShowCoverLetterTemplateSelector] = useState(false);

  // Derive Cover Letter Data
  useEffect(() => {
    if (resumeData && !generatedCoverLetter) {
      setGeneratedCoverLetter({
        recipient: "Hiring Manager",
        intro: `I am writing to express my strong interest in the ${resumeData.jobTitle || 'open position'} role at your company. With my background in ${resumeData.experience?.[0]?.title || 'my field'}, I am confident in my ability to contribute effectively to your team.`,
        body: `Throughout my career, I have developed a strong skillset in ${(resumeData.skills || []).map(s => typeof s === 'string' ? s : s.name).slice(0, 3).join(', ')}. My experience at ${resumeData.experience?.[0]?.company || 'various companies'} has prepared me to tackle complex challenges and deliver results.\n\nI am particularly impressed by your company's mission and values, and I believe my professional experience aligns perfectly with what you are looking for.`,
        closing: "Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience can benefit your team.",
        name: resumeData.name,
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location || resumeData.address // Handle address mapping
      });
    }
  }, [resumeData]);

  const tabs = [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'ats', label: 'ATS Report', icon: BarChart2 },
    { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
    { id: 'one-pager', label: 'One Pager', icon: Layout },
  ];

  const [error, setError] = useState(null);
  const [downloadEnabled, setDownloadEnabled] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [dataSource, setDataSource] = useState('snapshot'); // 'live' or 'snapshot'
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentCurrency, setPaymentCurrency] = useState('INR');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    type: 'info',
    message: '',
  });
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [isManuallyLocked, setIsManuallyLocked] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedResumeData, setEditedResumeData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState(null); // {section: 'name', path: 'name'}
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const params = useParams();
  const hostedId = useMemo(() => {
    const value = params?.id;
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);
  const { user } = useAuth();

  const zeroDecimalCurrencies = new Set(['JPY', 'KRW', 'VND']);
  const isLocked = (isExpired && paymentStatus !== 'paid') || isManuallyLocked;
  const showPaymentCTA = !downloadEnabled && paymentAmount > 0 && !isLocked;

  const openDialog = useCallback((type, message) => {
    setPaymentDialog({
      open: true,
      type,
      message,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setPaymentDialog({
      open: false,
      type: 'info',
      message: '',
    });
  }, []);

  const formatCurrency = (amount, currency = 'INR') => {
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    if (Number.isNaN(numericAmount)) {
      return '';
    }

    const upperCurrency = (currency || 'INR').toUpperCase();
    const fractionDigits = zeroDecimalCurrencies.has(upperCurrency) ? 0 : 2;

    try {
      return new Intl.NumberFormat(
        upperCurrency === 'INR' ? 'en-IN' : 'en-US',
        {
          style: 'currency',
          currency: upperCurrency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }
      ).format(numericAmount);
    } catch (error) {
      return `${upperCurrency} ${numericAmount}`;
    }
  };

  // Payment handled via Stripe Checkout redirect

  useEffect(() => {
    const abortController = new AbortController();

    const fetchResumeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hosted-resume/${hostedId}`, {
          signal: abortController.signal,
          cache: 'no-store',
          next: { revalidate: 0 },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Resume not found');
        }

        const data = await response.json();

        // Validate that we have actual resume data
        if (!data.resumeData || Object.keys(data.resumeData).length === 0) {
          throw new Error('Resume data is empty or corrupted');
        }

        const locked = Boolean(data.locked);
        const expired = Boolean(data.isExpired);

        // Ensure photo field is properly extracted from nested structures
        let normalizedResumeData = { ...data.resumeData };

        // Check for photo in nested personal/profile objects
        if (!normalizedResumeData.photo) {
          if (normalizedResumeData.personal?.photo) {
            normalizedResumeData.photo = normalizedResumeData.personal.photo;
          } else if (normalizedResumeData.profile?.photo) {
            normalizedResumeData.photo = normalizedResumeData.profile.photo;
          }
        }

        // Debug: Log photo field
        console.log('📸 Photo check in hosted resume:', {
          hasPhoto: !!(normalizedResumeData.photo),
          photoValue: normalizedResumeData.photo ? (normalizedResumeData.photo.substring(0, 50) + '...') : null,
          photoType: normalizedResumeData.photo ? (normalizedResumeData.photo.startsWith('http') ? 'URL' : normalizedResumeData.photo.startsWith('data:') ? 'base64' : 'other') : 'none',
          hasPersonalPhoto: !!(data.resumeData.personal?.photo),
          hasProfilePhoto: !!(data.resumeData.profile?.photo)
        });

        setResumeData(normalizedResumeData);
        setDownloadEnabled(Boolean(data.downloadEnabled) && !locked && !expired);
        setEditEnabled(Boolean(data.editEnabled));
        setSelectedTemplate(data.resumeData.template || 'modern_professional');
        setDataSource(data.dataSource || 'snapshot'); // Track if data is live or snapshot
        setPaymentAmount(data.paymentAmount ?? 0);
        setPaymentCurrency(data.paymentCurrency || 'INR');
        setPaymentStatus(data.paymentStatus || (data.downloadEnabled ? 'paid' : 'pending'));
        setIsExpired(expired);
        setIsManuallyLocked(locked);
        setExpiresAt(data.expiresAt || null);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Error loading hosted resume:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hostedId) {
      fetchResumeData();
    }

    return () => {
      abortController.abort();
    };
  }, [hostedId]);

  const handleEditMode = useCallback(() => {
    setEditedResumeData(JSON.parse(JSON.stringify(resumeData))); // Deep copy
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  }, [resumeData]);

  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setIsEditMode(false);
        setEditedResumeData(null);
        setEditingField(null);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditMode(false);
      setEditedResumeData(null);
      setEditingField(null);
    }
  }, [hasUnsavedChanges]);

  const updateField = useCallback((path, value) => {
    if (!editedResumeData) return;

    const newData = JSON.parse(JSON.stringify(editedResumeData));

    // Handle nested paths like 'experience.0.jobTitle'
    const pathParts = path.split('.');
    let current = newData;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      // Handle array indices
      if (!isNaN(part)) {
        current = current[parseInt(part)];
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }

    const lastPart = pathParts[pathParts.length - 1];
    if (!isNaN(lastPart)) {
      current[parseInt(lastPart)] = value;
    } else {
      current[lastPart] = value;
    }

    setEditedResumeData(newData);
    setHasUnsavedChanges(true);
  }, [editedResumeData]);

  const handleSaveChanges = useCallback(async () => {
    if (!editedResumeData || !hostedId) return;

    try {
      setIsSaving(true);
      toast.loading('Saving changes...', { id: 'save-resume' });

      const response = await fetch(`/api/hosted-resume/${hostedId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: editedResumeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      // Update local state
      setResumeData(editedResumeData);
      setHasUnsavedChanges(false);
      setEditingField(null);

      toast.success('Changes saved successfully!', { id: 'save-resume' });
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(`Failed to save: ${err.message}`, { id: 'save-resume' });
    } finally {
      setIsSaving(false);
    }
  }, [editedResumeData, hostedId]);

  const handleDownload = useCallback(async () => {
    if (!downloadEnabled) return;

    // If in edit mode, save first
    if (isEditMode && editedResumeData) {
      await handleSaveChanges();
      // Wait a bit for save to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      setIsGeneratingPDF(true);

      // Use edited data if available, otherwise use current resumeData
      const dataToUse = editedResumeData || resumeData;

      // Import all template collections to check category
      const { templates: baseTemplates } = await import('../../lib/templates');
      const { atsFriendlyTemplates } = await import('../../lib/atsFriendlyTemplates');
      const { visualAppealTemplates } = await import('../../lib/visualAppealTemplates');
      const { premiumDesignTemplates } = await import('../../lib/premiumDesignTemplates');

      // Merge all templates to find the correct one
      const allTemplates = { ...baseTemplates, ...atsFriendlyTemplates, ...visualAppealTemplates, ...premiumDesignTemplates };

      // Get the template name
      const templateName = selectedTemplate || resumeData.template || 'modern_professional';
      const currentTemplate = allTemplates[templateName];

      // Determine template type and API endpoint based on category
      const isATSTemplate = currentTemplate?.category === "ATS-Optimized" || templateName.startsWith('ats_');
      const isVisualAppealTemplate = currentTemplate?.category === "Visual Appeal" || templateName.startsWith('visual_');
      const isPremiumDesignTemplate = currentTemplate?.category === "Premium Design" || templateName.startsWith('premium_');

      let apiEndpoint = "/api/generate-pdf"; // Default
      if (isPremiumDesignTemplate) {
        apiEndpoint = "/api/generate-premium-design-pdf";
      } else if (isATSTemplate) {
        apiEndpoint = "/api/generate-ats-pdf";
      } else if (isVisualAppealTemplate) {
        apiEndpoint = "/api/generate-visual-appeal-pdf";
      }

      // Build request payload based on template type
      let requestPayload;
      if (isPremiumDesignTemplate) {
        // Premium Design templates: pass template key — API looks up from premiumDesignTemplates
        requestPayload = {
          data: dataToUse,
          template: templateName,
          customColors: dataToUse.customColors || {},
          language: dataToUse.language || 'en',
          country: dataToUse.country || 'us',
          preferences: dataToUse.preferences || {}
        };
      } else if (isATSTemplate) {
        // ATS templates: pass template object
        requestPayload = {
          data: dataToUse,
          template: currentTemplate
        };
      } else if (isVisualAppealTemplate) {
        // Visual Appeal templates: pass template object with colors and preferences
        requestPayload = {
          data: dataToUse,
          template: currentTemplate,
          customColors: dataToUse.customColors || {},
          language: dataToUse.language || 'en',
          country: dataToUse.country || 'us',
          preferences: dataToUse.preferences || {}
        };
      } else {
        // Regular templates: pass template name string with full options
        requestPayload = {
          data: dataToUse,
          template: templateName,
          customColors: dataToUse.customColors || {},
          language: dataToUse.language || 'en',
          country: dataToUse.country || 'us',
          isPremium: true, // No watermark for hosted resumes
          preferences: dataToUse.preferences || {}
        };
      }

      console.log('📄 PDF Download:', {
        template: templateName,
        category: currentTemplate?.category,
        type: isATSTemplate ? 'ATS' : isVisualAppealTemplate ? 'Visual Appeal' : 'Regular',
        api: apiEndpoint
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('PDF generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataToUse.name || 'Resume'}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      openDialog('error', `Failed to download PDF: ${err.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [downloadEnabled, resumeData, selectedTemplate, isEditMode, editedResumeData, handleSaveChanges]);

  const handleOnePagerDownload = useCallback(async () => {
    if (!downloadEnabled) return;

    try {
      setIsGeneratingPDF(true);
      setProgressOverlay({ isVisible: true, type: 'onepager' });

      // Artificial delay to show the "AI optimizing" stages
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch('/api/download-one-pager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: editedResumeData || resumeData,
          template: onePagerTemplate
        })
      });

      if (!response.ok) throw new Error('Failed to generate One Pager PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name || 'Resume'}_OnePager.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('One Pager Download Error:', error);
      openDialog('error', 'Failed to download One Pager PDF');
    } finally {
      setIsGeneratingPDF(false);
      // Small delay to let the success animation play if we had one, or just close it
      setTimeout(() => setProgressOverlay(prev => ({ ...prev, isVisible: false })), 500);
    }
  }, [downloadEnabled, editedResumeData, resumeData, onePagerTemplate]);

  const handleCoverLetterDownload = useCallback(async () => {
    if (!downloadEnabled || !generatedCoverLetter) return;

    try {
      setIsGeneratingPDF(true);
      setProgressOverlay({ isVisible: true, type: 'download' });

      // Artificial delay to show the nice messages
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/generate-cover-letter-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: generatedCoverLetter,
          template: coverLetterTemplate,
          resumeData: resumeData,
          isPremium: true
        })
      });

      if (!response.ok) throw new Error('Failed to generate Cover Letter PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name || 'Resume'}_CoverLetter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Cover Letter Download Error:', error);
      openDialog('error', 'Failed to download Cover Letter PDF');
    } finally {
      setIsGeneratingPDF(false);
      setTimeout(() => setProgressOverlay(prev => ({ ...prev, isVisible: false })), 500);
    }
  }, [downloadEnabled, generatedCoverLetter, coverLetterTemplate, resumeData]);


  // Cover Letter Editing Handlers
  const handleEditCoverLetter = useCallback(() => {
    setEditedCoverLetterData(JSON.parse(JSON.stringify(generatedCoverLetter)));
    setIsEditingCoverLetter(true);
  }, [generatedCoverLetter]);

  const handleSaveCoverLetter = useCallback(() => {
    setGeneratedCoverLetter(editedCoverLetterData);
    setIsEditingCoverLetter(false);
    setEditedCoverLetterData(null);
    toast.success('Cover Letter updated!');
  }, [editedCoverLetterData]);

  const handleCancelCoverLetter = useCallback(() => {
    setIsEditingCoverLetter(false);
    setEditedCoverLetterData(null);
  }, []);

  const handlePayAndDownload = useCallback(async () => {
    if (isProcessingPayment || paymentAmount <= 0) {
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentStatus('processing');

      const customerName = resumeData?.name || '';
      const customerEmail = resumeData?.contact?.email || resumeData?.email || '';
      const customerContact = resumeData?.contact?.phone || resumeData?.phone || resumeData?.contactNumber || '';

      const orderResponse = await fetch('/api/hosted-resume/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostedId,
          customerName,
          customerEmail,
          customerContact,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate payment.');
      }

      // Track payment initiation analytics
      event({
        action: 'service_payment_initiated',
        category: 'Hosted Resume Payment',
        label: `Hosted Resume: ${hostedId}`,
        value: paymentAmount,
      });

      // Redirect to Stripe Checkout
      window.location.href = orderData.url;

    } catch (error) {
      console.error('Payment initiation failed:', error);
      openDialog('error', error.message || 'Unable to initiate payment. Please try again.');
      setIsProcessingPayment(false);
      setPaymentStatus('pending');
    }
  }, [
    isProcessingPayment,
    paymentAmount,
    hostedId,
    resumeData,
    handleDownload,
    openDialog,
  ]);

  if (loading) {
    return <HostedResumeSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600">{error}</p>
          <a
            href="https://expertresume.com"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Your Resume
          </a>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-gray-500 text-5xl sm:text-6xl mb-3 sm:mb-4">📄</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Resume Data</h1>
          <p className="text-sm sm:text-base text-gray-600">This resume could not be loaded.</p>
          <a
            href="https://expertresume.com"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Your Resume
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${showPaymentCTA ? 'pb-24 sm:pb-0' : ''}`}>
      <div className={isLocked ? 'filter blur-sm pointer-events-none select-none' : ''}>
        {/* Header - Mobile Responsive */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Mobile Layout: Stacked */}
            <div className="flex flex-col space-y-3 sm:hidden">
              <div>
                <h1 className="text-base font-semibold text-gray-900 truncate">
                  {resumeData.name || 'Resume'} <span className="text-gray-500 text-sm">- Hosted</span>
                </h1>
                <div className="mt-1 flex items-center flex-wrap gap-1.5">
                  {selectedTemplate && templates[selectedTemplate] && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {templates[selectedTemplate].name}
                    </span>
                  )}
                  {dataSource === 'live' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3">
                          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                      Live
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Edit Button - Mobile */}
                {downloadEnabled && editEnabled && !isEditMode && (
                  <button
                    onClick={handleEditMode}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="whitespace-nowrap">Edit</span>
                  </button>
                )}

                {/* Template Selector Button - Mobile */}
                {!isEditMode && (
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span className="whitespace-nowrap">Template</span>
                  </button>
                )}

                {/* Save/Cancel Buttons - Mobile (Edit Mode) */}
                {isEditMode && (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span className="whitespace-nowrap">Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="whitespace-nowrap">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="whitespace-nowrap">Save</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {downloadEnabled && !isEditMode ? (
                  <button
                    onClick={handleDownload}
                    disabled={isGeneratingPDF || isSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                  >
                    {isGeneratingPDF || isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="whitespace-nowrap">{isSaving ? 'Saving...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="whitespace-nowrap">{isEditMode ? 'Save & Download' : 'Download'}</span>
                      </>
                    )}
                  </button>
                ) : paymentAmount > 0 ? (
                  <button
                    onClick={handlePayAndDownload}
                    disabled={isProcessingPayment}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1.5"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="whitespace-nowrap">Processing...</span>
                      </>
                    ) : (
                      <>

                        <span className="whitespace-nowrap">
                          Pay {formatCurrency(paymentAmount, paymentCurrency)} & Download
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="whitespace-nowrap">Locked</span>
                  </div>
                )}
              </div>
              {!downloadEnabled && paymentAmount > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Pay {formatCurrency(paymentAmount, paymentCurrency)} to unlock download access.
                </p>
              )}
            </div>

            {/* Desktop Layout: Horizontal */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                  {resumeData.name || 'Resume'} - Hosted Preview
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center flex-wrap gap-1.5">
                  <span>Professional resume hosted by ExpertResume</span>
                  {selectedTemplate && templates[selectedTemplate] && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {templates[selectedTemplate].name}
                    </span>
                  )}
                  {dataSource === 'live' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3">
                          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                      Live Updates
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                {/* Edit Button - Desktop */}
                {downloadEnabled && editEnabled && !isEditMode && (
                  <button
                    onClick={handleEditMode}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden md:inline">Edit Resume</span>
                    <span className="md:hidden">Edit</span>
                  </button>
                )}

                {/* Template Selector Button - Desktop */}
                {!isEditMode && (
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span className="hidden md:inline">Change Template</span>
                    <span className="md:hidden">Template</span>
                  </button>
                )}

                {/* Save/Cancel Buttons - Desktop (Edit Mode) */}
                {isEditMode && (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden md:inline">Cancel</span>
                      <span className="md:hidden">Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="whitespace-nowrap">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden md:inline">Save Changes</span>
                          <span className="md:hidden">Save</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {downloadEnabled ? (
                  <button
                    onClick={handleDownload}
                    disabled={isGeneratingPDF || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                  >
                    {isGeneratingPDF || isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="whitespace-nowrap">{isSaving ? 'Saving...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden md:inline">{isEditMode ? 'Save & Download PDF' : 'Download PDF'}</span>
                        <span className="md:hidden">{isEditMode ? 'Save & Download' : 'Download'}</span>
                      </>
                    )}
                  </button>
                ) : paymentAmount > 0 ? (
                  <button
                    onClick={handlePayAndDownload}
                    disabled={isProcessingPayment}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 lg:space-x-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="whitespace-nowrap">Processing...</span>
                      </>
                    ) : (
                      <>

                        <span className="hidden md:inline">
                          Pay {formatCurrency(paymentAmount, paymentCurrency)} & Download
                        </span>
                        <span className="md:hidden">
                          Pay & Download
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-gray-100 text-gray-500 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 lg:space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden md:inline">Download Disabled</span>
                    <span className="md:hidden">Locked</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector Panel - Mobile Responsive */}
        {showTemplateSelector && (
          <div className="bg-white border-b shadow-md">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {activeTab === 'one-pager' ? 'Choose One Pager Template' : 'Choose Resume Template'}
                </h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close template selector"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 4-5 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                {(activeTab === 'one-pager'
                  ? Object.values(onePagerTemplates).map(t => [t.templateId, t])
                  : Object.entries(templates)
                ).map(([templateId, templateData]) => (
                  <button
                    key={templateId}
                    onClick={() => {
                      if (activeTab === 'one-pager') {
                        setOnePagerTemplate(templateId);
                      } else {
                        setSelectedTemplate(templateId);
                      }
                      setShowTemplateSelector(false);
                    }}
                    className={`relative group rounded-lg border-2 p-2 sm:p-3 transition-all duration-200 hover:shadow-lg active:scale-95 ${(activeTab === 'one-pager' ? onePagerTemplate : selectedTemplate) === templateId
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className="aspect-[8.5/11] bg-white rounded overflow-hidden mb-1.5 sm:mb-2 shadow-sm">
                      {templateData.previewImage ? (
                        <img
                          src={templateData.previewImage}
                          alt={templateData.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                          No Preview
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{templateData.name}</p>
                      {templateData.category && (
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{templateData.category}</p>
                      )}
                    </div>
                    {(activeTab === 'one-pager' ? onePagerTemplate : selectedTemplate) === templateId && (
                      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-blue-600 text-white rounded-full p-0.5 sm:p-1 shadow-md">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Promotional Banner */}
        {!isEditMode && <PromotionalBanner />}

        {/* Unsaved Changes Banner */}
        {isEditMode && hasUnsavedChanges && (
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Edit Form - Mobile Responsive (Hidden, keeping for reference) */}
        {false && isEditMode && editedResumeData && (
          <div className="max-w-4xl sm:mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="bg-white shadow-md sm:shadow-lg rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold">Edit Resume</h2>
                <p className="text-sm text-blue-100 mt-1">Make changes to your resume. Click "Save" to update, then "Download" to get the updated PDF.</p>
              </div>

              <div className="p-4 sm:p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Personal Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editedResumeData.name || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={editedResumeData.jobTitle || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, jobTitle: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editedResumeData.email || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editedResumeData.phone || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={editedResumeData.address || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                  <textarea
                    value={editedResumeData.summary || ''}
                    onChange={(e) => setEditedResumeData({ ...editedResumeData, summary: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write a brief summary of your professional background..."
                  />
                </div>

                {/* Experience */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Work Experience</h3>
                    <button
                      onClick={() => {
                        const newExp = {
                          jobTitle: '',
                          company: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          location: ''
                        };
                        setEditedResumeData({
                          ...editedResumeData,
                          experience: [...(editedResumeData.experience || []), newExp]
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(editedResumeData.experience || []).map((exp, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Experience #{idx + 1}</h4>
                          <button
                            onClick={() => {
                              const newExp = [...(editedResumeData.experience || [])];
                              newExp.splice(idx, 1);
                              setEditedResumeData({ ...editedResumeData, experience: newExp });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input
                              type="text"
                              value={exp.jobTitle || ''}
                              onChange={(e) => {
                                const newExp = [...(editedResumeData.experience || [])];
                                newExp[idx] = { ...exp, jobTitle: e.target.value };
                                setEditedResumeData({ ...editedResumeData, experience: newExp });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const newExp = [...(editedResumeData.experience || [])];
                                newExp[idx] = { ...exp, company: e.target.value };
                                setEditedResumeData({ ...editedResumeData, experience: newExp });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate || ''}
                              onChange={(e) => {
                                const newExp = [...(editedResumeData.experience || [])];
                                newExp[idx] = { ...exp, startDate: e.target.value };
                                setEditedResumeData({ ...editedResumeData, experience: newExp });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="MM/YYYY"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={exp.endDate || ''}
                              onChange={(e) => {
                                const newExp = [...(editedResumeData.experience || [])];
                                newExp[idx] = { ...exp, endDate: e.target.value };
                                setEditedResumeData({ ...editedResumeData, experience: newExp });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="MM/YYYY or Present"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={exp.description || ''}
                              onChange={(e) => {
                                const newExp = [...(editedResumeData.experience || [])];
                                newExp[idx] = { ...exp, description: e.target.value };
                                setEditedResumeData({ ...editedResumeData, experience: newExp });
                              }}
                              rows={3}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Education</h3>
                    <button
                      onClick={() => {
                        const newEdu = {
                          degree: '',
                          school: '',
                          graduationDate: '',
                          description: ''
                        };
                        setEditedResumeData({
                          ...editedResumeData,
                          education: [...(editedResumeData.education || []), newEdu]
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(editedResumeData.education || []).map((edu, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Education #{idx + 1}</h4>
                          <button
                            onClick={() => {
                              const newEdu = [...(editedResumeData.education || [])];
                              newEdu.splice(idx, 1);
                              setEditedResumeData({ ...editedResumeData, education: newEdu });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree || ''}
                              onChange={(e) => {
                                const newEdu = [...(editedResumeData.education || [])];
                                newEdu[idx] = { ...edu, degree: e.target.value };
                                setEditedResumeData({ ...editedResumeData, education: newEdu });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
                            <input
                              type="text"
                              value={edu.school || ''}
                              onChange={(e) => {
                                const newEdu = [...(editedResumeData.education || [])];
                                newEdu[idx] = { ...edu, school: e.target.value };
                                setEditedResumeData({ ...editedResumeData, education: newEdu });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                            <input
                              type="text"
                              value={edu.graduationDate || ''}
                              onChange={(e) => {
                                const newEdu = [...(editedResumeData.education || [])];
                                newEdu[idx] = { ...edu, graduationDate: e.target.value };
                                setEditedResumeData({ ...editedResumeData, education: newEdu });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="YYYY"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <input
                              type="text"
                              value={edu.description || ''}
                              onChange={(e) => {
                                const newEdu = [...(editedResumeData.education || [])];
                                newEdu[idx] = { ...edu, description: e.target.value };
                                setEditedResumeData({ ...editedResumeData, education: newEdu });
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Skills</h3>

                  {/* Helper function to normalize skills */}
                  {(() => {
                    const normalizeSkill = (skill) => {
                      if (typeof skill === 'string') return skill;
                      if (skill && typeof skill === 'object') {
                        return skill.name || skill.skill || skill.label || String(skill);
                      }
                      return String(skill || '');
                    };

                    const skillsArray = Array.isArray(editedResumeData.skills)
                      ? editedResumeData.skills.map(normalizeSkill).filter(Boolean)
                      : [];

                    return (
                      <div className="space-y-3">
                        {/* Skills List */}
                        <div className="flex flex-wrap gap-2">
                          {skillsArray.map((skill, index) => (
                            <div
                              key={index}
                              className="group flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
                            >
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) => {
                                  const newSkills = [...skillsArray];
                                  newSkills[index] = e.target.value;
                                  setEditedResumeData({ ...editedResumeData, skills: newSkills });
                                  setHasUnsavedChanges(true);
                                }}
                                className="bg-transparent border-none outline-none text-sm text-gray-900 flex-1 min-w-[100px]"
                                placeholder="Skill name"
                              />
                              <button
                                onClick={() => {
                                  const newSkills = skillsArray.filter((_, i) => i !== index);
                                  setEditedResumeData({ ...editedResumeData, skills: newSkills });
                                  setHasUnsavedChanges(true);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove skill"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Skill Button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newSkills = [...skillsArray, ''];
                              setEditedResumeData({ ...editedResumeData, skills: newSkills });
                              setHasUnsavedChanges(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Plus size={16} />
                            Add Skill
                          </button>

                          {/* Quick Add Textarea */}
                          <div className="flex-1">
                            <textarea
                              placeholder="Or paste skills separated by commas (e.g., JavaScript, React, Node.js)"
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value) {
                                  const newSkills = value.split(',').map(s => s.trim()).filter(Boolean);
                                  const combined = [...skillsArray.filter(Boolean), ...newSkills];
                                  const unique = [...new Set(combined)];
                                  setEditedResumeData({ ...editedResumeData, skills: unique });
                                  setHasUnsavedChanges(true);
                                  e.target.value = '';
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  e.target.blur();
                                }
                              }}
                              rows={1}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Click on a skill to edit, or paste multiple skills separated by commas</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Additional Sections */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (Optional)</label>
                      <input
                        type="url"
                        value={editedResumeData.linkedin || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, linkedin: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio/Website (Optional)</label>
                      <input
                        type="url"
                        value={editedResumeData.portfolio || ''}
                        onChange={(e) => setEditedResumeData({ ...editedResumeData, portfolio: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation - Desktop */}
        <div className="hidden sm:block bg-white border-b sticky top-[65px] z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap outline-none
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    <Icon className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile Bottom Bar */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 pb-safe">
          <div className="grid grid-cols-4 gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors
                    ${activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`
                    h-5 w-5 mb-1
                    ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}
                  `} />
                  <span className="text-[10px] font-medium leading-tight text-center">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[calc(100vh-200px)]">
          {/* Resume Tab */}
          <div className={activeTab === 'resume' ? 'block' : 'hidden'}>
            <div className={`max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 ${isEditMode ? 'lg:grid lg:grid-cols-12 lg:gap-6' : ''} relative`}>

              {/* Floating Edit Panel - Desktop */}
              {isEditMode && editedResumeData && (
                <motion.div
                  initial={{ x: -400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -400, opacity: 0 }}
                  className="hidden lg:block lg:col-span-4"
                >
                  <div className="bg-white shadow-xl rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        <span className="font-semibold">Quick Edit</span>
                      </div>
                      {hasUnsavedChanges && (
                        <span className="text-yellow-200 text-xs animate-pulse">• Unsaved</span>
                      )}
                    </div>

                    <div className="p-4">
                      <ResumeEditForm
                        editedResumeData={editedResumeData}
                        updateField={updateField}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resume Preview */}
              <div className={`${isEditMode ? 'lg:col-span-8' : 'max-w-4xl mx-auto'}`}>
                <div className="bg-white shadow-md sm:shadow-lg rounded-lg overflow-hidden relative">
                  {/* Edit Mode Indicator */}
                  {isEditMode && (
                    <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Mode: Changes reflect in real-time</span>
                      </div>
                      {hasUnsavedChanges && (
                        <span className="text-yellow-200 text-xs animate-pulse">• Unsaved changes</span>
                      )}
                    </div>
                  )}

                  {/* Mobile: Add zoom hint */}
                  {!isEditMode && (
                    <div className="sm:hidden bg-blue-50 border-b border-blue-100 px-3 py-2 text-left">
                      <p className="text-xs text-blue-700 flex items-center space-x-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <span>Scroll horizontally or pinch to zoom</span>
                      </p>
                    </div>
                  )}

                  {/* Resume container */}
                  <div className="overflow-x-auto overflow-y-visible">
                    <div className="min-w-[320px] sm:mx-auto">
                      <ResumePreview
                        data={editedResumeData || resumeData}
                        template={selectedTemplate || resumeData.template || 'modern_professional'}
                        customColors={resumeData.customColors || {}}
                        language={resumeData.language || 'en'}
                        country={resumeData.country || 'in'}
                        preferences={resumeData.preferences || {}}
                        isPremium={true}
                        isHosted={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Edit Panel - Bottom Sheet */}
              {isEditMode && editedResumeData && (
                <motion.div
                  initial={{ y: 400, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 400, opacity: 0 }}
                  className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      <span className="font-semibold">Quick Edit</span>
                    </div>
                    {hasUnsavedChanges && (
                      <span className="text-yellow-200 text-xs animate-pulse">• Unsaved</span>
                    )}
                  </div>

                  <div className="p-4">
                    <ResumeEditForm
                      editedResumeData={editedResumeData}
                      updateField={updateField}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer - Mobile Responsive */}
            <div className="bg-white border-t mt-6 sm:mt-12">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Powered by <span className="font-semibold text-blue-600">ExpertResume</span>
                    <span className="hidden sm:inline"> - Professional Resume Builder</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    Create your own professional resume at{' '}
                    <a
                      href="https://expertresume.com"
                      className="text-blue-500 hover:text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      expertresume.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* ATS Report Tab */}
          {activeTab === 'ats' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
              {/* Gradient Blur Overlay */}
              {paymentStatus !== 'paid' && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute inset-0" style={{ backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '30%', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '60%', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-8 pointer-events-auto flex items-end justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handlePayAndDownload(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl text-lg transition-all transform hover:scale-105">
                      🔓 Unlock Full Report
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-end mb-4">
                <button
                  onClick={async () => {
                    if (!downloadEnabled) return;
                    try {
                      setProgressOverlay({ isVisible: true, type: 'download' });
                      // Artificial delay for UX
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      const response = await fetch('/api/generate-ats-report-pdf', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          analysisResult: resumeData.analysisResult,
                          resumeData: resumeData
                        })
                      });

                      if (!response.ok) throw new Error('Failed to generate ATS Report');

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${resumeData.name || 'Resume'}_ATS_Report.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('ATS Download Error:', error);
                      openDialog('error', 'Failed to download ATS Report');
                    } finally {
                      setTimeout(() => setProgressOverlay(prev => ({ ...prev, isVisible: false })), 500);
                    }
                  }}
                  disabled={!downloadEnabled}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${!downloadEnabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  title={!downloadEnabled ? "Pay to unlock download" : "Download Report"}
                >
                  {!downloadEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  Download Report
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[600px]">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900">Generating ATS Report...</h3>
                    <p className="text-gray-500 mt-2">Analyzing your resume against industry standards</p>
                  </div>
                ) : !resumeData.analysisResult && (resumeData.atsScore === undefined || resumeData.atsScore === null) ? (
                  <div className="text-center py-12">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <BarChart2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Analysis Failed</h3>
                    <p className="mt-1 text-sm text-gray-500">We couldn't generate the report. Please try again.</p>
                    <button
                      onClick={generateAtsReport}
                      className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Retry Analysis
                    </button>
                  </div>
                ) : (
                  <ModernAnalysisDisplay
                    result={resumeData.analysisResult || { overallScore: resumeData.atsScore || 0 }}
                    isPremium={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* Cover Letter Tab */}
          {activeTab === 'cover-letter' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
              {/* Gradient Blur Overlay */}
              {paymentStatus !== 'paid' && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute inset-0" style={{ backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '30%', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '60%', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-8 pointer-events-auto flex items-end justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handlePayAndDownload(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl text-lg transition-all transform hover:scale-105">
                      🔓 Unlock Cover Letter
                    </button>
                  </div>
                </div>
              )}
              <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500">Template:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {coverLetterTemplates[coverLetterTemplate]?.name || 'Classic Professional'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCoverLetterTemplateSelector(true)}
                    disabled={isEditingCoverLetter}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Layout className="w-4 h-4" />
                    Change Template
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                  {!isEditingCoverLetter ? (
                    <>
                      <button
                        onClick={handleEditCoverLetter}
                        disabled={!generatedCoverLetter}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Content
                      </button>
                      <button
                        onClick={handleCoverLetterDownload}
                        disabled={!downloadEnabled}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${!downloadEnabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        title={!downloadEnabled ? "Pay to unlock download" : "Download Cover Letter"}
                      >
                        {!downloadEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download PDF
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelCoverLetter}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCoverLetter}
                        className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={`grid ${isEditingCoverLetter ? 'lg:grid-cols-12 gap-6' : ''}`}>
                {/* Editor Form */}
                {isEditingCoverLetter && editedCoverLetterData && (
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Edit Cover Letter Details</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Title</label>
                          <input
                            type="text"
                            value={editedCoverLetterData.jobTitle || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, jobTitle: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Target Company</label>
                          <input
                            type="text"
                            value={editedCoverLetterData.company || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, company: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name/Title</label>
                          <input
                            type="text"
                            value={editedCoverLetterData.recipient || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, recipient: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                            placeholder="e.g. Dear Hiring Manager"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Intro</label>
                          <textarea
                            rows={4}
                            value={editedCoverLetterData.intro || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, intro: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
                          <textarea
                            rows={8}
                            value={editedCoverLetterData.body || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, body: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Closing</label>
                          <textarea
                            rows={3}
                            value={editedCoverLetterData.closing || ''}
                            onChange={(e) => setEditedCoverLetterData({ ...editedCoverLetterData, closing: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Area */}
                <div className={`${isEditingCoverLetter ? 'lg:col-span-8' : ''}`}>
                  <div className="bg-white shadow-lg rounded-xl overflow-hidden min-h-[800px] flex justify-center py-8 bg-gray-50/50">
                    {(isEditingCoverLetter ? editedCoverLetterData : generatedCoverLetter) ? (
                      <CoverLetterPreview
                        data={isEditingCoverLetter ? editedCoverLetterData : generatedCoverLetter}
                        template={coverLetterTemplate}
                        customColors={{}}
                        resumeData={resumeData}
                        isPremium={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">Generating Cover Letter...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* One Pager Tab */}
          {activeTab === 'one-pager' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
              {/* Gradient Blur Overlay */}
              {paymentStatus !== 'paid' && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute inset-0" style={{ backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '30%', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
                  <div className="absolute inset-0" style={{ top: '60%', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-32 pb-8 pointer-events-auto flex items-end justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handlePayAndDownload(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl text-lg transition-all transform hover:scale-105">
                      🔓 Unlock One Pager
                    </button>
                  </div>
                </div>
              )}
              {/* Mobile Edit Panel - Bottom Sheet */}
              {isEditMode && editedResumeData && (
                <motion.div
                  initial={{ y: 400, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 400, opacity: 0 }}
                  className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
                >
                  <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      <span className="font-semibold">Quick Edit</span>
                    </div>
                    {hasUnsavedChanges && (
                      <span className="text-yellow-200 text-xs animate-pulse">• Unsaved</span>
                    )}
                  </div>

                  <div className="p-4">
                    <ResumeEditForm
                      editedResumeData={editedResumeData}
                      updateField={updateField}
                    />
                  </div>
                </motion.div>
              )}

              <div className={`${isEditMode ? 'lg:grid lg:grid-cols-12 lg:gap-6' : ''}`}>
                {/* Desktop Edit Panel */}
                {isEditMode && editedResumeData && (
                  <motion.div
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    className="hidden lg:block lg:col-span-4"
                  >
                    <div className="bg-white shadow-xl rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                          <span className="font-semibold">Quick Edit</span>
                        </div>
                        {hasUnsavedChanges && (
                          <span className="text-yellow-200 text-xs animate-pulse">• Unsaved</span>
                        )}
                      </div>

                      <div className="p-4">
                        <ResumeEditForm
                          editedResumeData={editedResumeData}
                          updateField={updateField}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Main Content Area */}
                <div className={`${isEditMode ? 'lg:col-span-8' : ''}`}>
                  <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">One Pager Summary</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {Object.values(onePagerTemplates).find(t => t.templateId === onePagerTemplate)?.name || onePagerTemplate}
                      </span>
                      <button
                        onClick={() => setShowTemplateSelector(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm"
                      >
                        <Layout className="w-4 h-4" />
                        Change Template
                      </button>
                      <button
                        onClick={handleOnePagerDownload}
                        disabled={!downloadEnabled}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${!downloadEnabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        title={!downloadEnabled ? "Pay to unlock download" : "Download One Pager"}
                      >
                        {!downloadEnabled ? <Lock className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="min-h-[800px] border rounded-xl overflow-hidden shadow-sm bg-white">
                    <OnePagerPreview
                      data={editedResumeData || resumeData}
                      template={onePagerTemplate}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {isLocked && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-9.95 9h1.95a8.05 8.05 0 108.05-8V2z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {isManuallyLocked ? 'Resume Locked' : 'Access Link Expired'}
              </h2>
              <p className="text-sm text-gray-600">
                {isManuallyLocked
                  ? 'This resume is locked due to non activity. Please pay to unlock or ask an admin to unlock this resume.'
                  : 'Hosted resume links remain active for 2 hours. Complete the payment to unlock the download or contact an admin to extend access.'}
              </p>
              {expiresAt && !isManuallyLocked && (
                <p className="text-xs text-gray-500">
                  Original expiry: {new Date(expiresAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-3">
              {paymentAmount > 0 ? (
                <button
                  onClick={handlePayAndDownload}
                  disabled={isProcessingPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Pay {formatCurrency(paymentAmount, paymentCurrency)} & Unlock</span>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  Please contact an administrator to unlock this resume.
                </p>
              )}
              <a
                href="mailto:hello@expertresume.com"
                className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Contact admin for assistance
              </a>
            </div>
          </div>
        </div>
      )}

      {paymentDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div
              className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${paymentDialog.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
            >
              {paymentDialog.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {paymentDialog.type === 'success' ? 'Payment Successful' : (paymentDialog.type === 'error' ? 'Error' : 'Payment Issue')}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {paymentDialog.message}
            </p>
            <button
              onClick={closeDialog}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPaymentCTA && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40">
          <div className="bg-white border-t shadow-lg px-4 py-4">
            <button
              onClick={handlePayAndDownload}
              disabled={isProcessingPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>

                  <span>Pay {formatCurrency(paymentAmount, paymentCurrency)} & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cover Letter Template Selector Modal */}
      {showCoverLetterTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose Cover Letter Template</h2>
                <p className="text-sm text-gray-500">Select a template that matches your style</p>
              </div>
              <button
                onClick={() => setShowCoverLetterTemplateSelector(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(coverLetterTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCoverLetterTemplate(key);
                      setShowCoverLetterTemplateSelector(false);
                      toast.success(`Selected ${template.name} template`);
                    }}
                    className={`group relative flex flex-col bg-white rounded-xl overflow-hidden text-left transition-all duration-200 hover:shadow-lg border-2 ${coverLetterTemplate === key
                      ? 'border-blue-600 shadow-md ring-1 ring-blue-600'
                      : 'border-transparent hover:border-blue-200'
                      }`}
                  >
                    {/* Header Preview Strip */}
                    <div
                      className="h-3 w-full"
                      style={{
                        background: template.styles?.colors?.primary || '#333'
                      }}
                    />

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">
                          {template.category}
                        </span>
                        {template.premium && (
                          <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock size={10} /> PREMIUM
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>

                      <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                        {template.description}
                      </p>

                      {/* Mini Visual Traits */}
                      <div className="flex gap-2 mt-auto">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                          style={{ background: template.styles?.colors?.primary }}
                          title="Primary Color"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                          style={{ background: template.styles?.colors?.accent }}
                          title="Accent Color"
                        />
                        <div className="ml-auto text-xs text-gray-400 flex items-center font-mono bg-gray-100 px-2 py-1 rounded">
                          {template.styles?.fontFamily?.split(',')[0].replace(/['"]/g, '')}
                        </div>
                      </div>
                    </div>

                    {/* Checkmark for selected */}
                    {coverLetterTemplate === key && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overlay */}
      <ProgressOverlay isVisible={progressOverlay.isVisible} type={progressOverlay.type} />

      <Toaster position="top-right" />
    </div>
  );
}
