"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import OnePagerResumeFormAI from '../../components/OnePagerResumeFormAI';
import OnePagerPreview from '../../components/OnePagerPreview';
import PremiumPdfPreview from '../../components/PremiumPdfPreview';
import Image from 'next/image';
import { Download, Loader2, LayoutGrid, ArrowLeft, Eye, X, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getPlanConfig, getDownloadLimitMessage } from '../../lib/planConfig';
import { event } from '../../lib/gtag';
import { useProfileGuard } from '../../hooks/useProfileGuard';

const TEMPLATES = [
  { id: 'classic', name: 'Classic Professional', description: 'Clean single column' },
  { id: 'modern', name: 'Modern Two-Column', description: 'Sidebar layout' },
  { id: 'compact', name: 'Compact Minimal', description: 'Maximum space' },
  { id: 'executive', name: 'Executive', description: 'Professional accent' },
  { id: 'tech', name: 'Tech-Focused', description: 'Developer style' },
  { id: 'creative', name: 'Creative', description: 'Visual and modern' },
  { id: 'timeline', name: 'Timeline Journey', description: 'Elegant timeline with visual markers' },
  { id: 'grid', name: 'Modern Grid', description: 'Card-based box layout' },
  { id: 'elegant', name: 'Elegant Serif', description: 'Minimalist with white space' },
  { id: 'bold', name: 'Bold Impact', description: 'Dramatic asymmetric design' },
  { id: 'magazine', name: 'Magazine Editorial', description: 'Multi-column newspaper style' },
  { id: 'modern_tech', name: 'Modern Tech', description: 'Tech-focused double column with dark sidebar' },
  { id: 'creative_bold', name: 'Creative Bold', description: 'Bold, artistic design with unique typography' },
  { id: 'professional_serif', name: 'Professional Serif', description: 'Elegant serif fonts for high readability' },
  { id: 'graceful_elegance', name: 'Graceful Elegance', description: 'Sophisticated and refined' }
];

// Helper function to check if content is sparse and needs enhancement
const checkAndAutoEnhance = async (data) => {
  // Calculate approximate character count
  const summaryLength = (data.summary || '').length;
  const experienceLength = (data.experience || []).reduce((sum, exp) =>
    sum + (exp.description || '').length, 0);
  const projectsLength = (data.projects || []).reduce((sum, proj) =>
    sum + (proj.description || '').length, 0);

  const totalContentLength = summaryLength + experienceLength + projectsLength;

  // If total content is less than 1500 chars (roughly half a page), auto-enhance
  const isSparse = totalContentLength < 1500;

  // Also check if individual items are very short (less than 100 chars)
  const hasShortExperiences = (data.experience || []).some(exp =>
    (exp.description || '').length < 100);
  const hasShortProjects = (data.projects || []).some(proj =>
    (proj.description || '').length < 80);

  console.log('[One-Pager Auto-Enhance Check]', {
    totalContentLength,
    isSparse,
    hasShortExperiences,
    hasShortProjects,
    shouldEnhance: isSparse || hasShortExperiences || hasShortProjects
  });

  return isSparse || hasShortExperiences || hasShortProjects;
};

// Helper function to auto-enhance content
const autoEnhanceContent = async (data) => {
  const enhancedData = { ...data };

  try {
    // Enhance summary if it's short
    if ((data.summary || '').length < 200) {
      const summaryResponse = await fetch('/api/enhance-one-pager-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'summary',
          currentText: data.summary || '',
          context: {
            jobTitle: data.personal?.jobTitle,
            experience: data.experience,
            skills: data.skills
          }
        })
      });

      if (summaryResponse.ok) {
        const result = await summaryResponse.json();
        if (result.suggestions && result.suggestions.length > 0) {
          enhancedData.summary = result.suggestions[0]; // Use first suggestion
        }
      }
    }

    // Enhance experience descriptions if they're short
    if (data.experience && data.experience.length > 0) {
      enhancedData.experience = await Promise.all(
        data.experience.map(async (exp, index) => {
          if ((exp.description || '').length < 100) {
            try {
              const response = await fetch('/api/enhance-one-pager-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  field: `experience-${index}`,
                  currentText: exp.description || '',
                  context: {
                    title: exp.title,
                    company: exp.company,
                    index
                  }
                })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.suggestions && result.suggestions.length > 0) {
                  return { ...exp, description: result.suggestions[0] };
                }
              }
            } catch (error) {
              console.error(`Error enhancing experience ${index}:`, error);
            }
          }
          return exp;
        })
      );
    }

    // Enhance project descriptions if they're short
    if (data.projects && data.projects.length > 0) {
      enhancedData.projects = await Promise.all(
        data.projects.map(async (proj, index) => {
          if ((proj.description || '').length < 80) {
            try {
              const response = await fetch('/api/enhance-one-pager-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  field: `project-${index}`,
                  currentText: proj.description || '',
                  context: {
                    name: proj.name,
                    technologies: proj.technologies,
                    index
                  }
                })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.suggestions && result.suggestions.length > 0) {
                  return { ...proj, description: result.suggestions[0] };
                }
              }
            } catch (error) {
              console.error(`Error enhancing project ${index}:`, error);
            }
          }
          return proj;
        })
      );
    }

    console.log('[One-Pager Auto-Enhance] Enhanced data ready');
    return enhancedData;
  } catch (error) {
    console.error('[One-Pager Auto-Enhance] Error:', error);
    return data; // Return original data on error
  }
};

function OnePagerEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [zoomedTemplate, setZoomedTemplate] = useState(null);

  // Profile Guard
  const { checkProfileAccess, ProfileGuardModal, setIsProfileLimitModalOpen, isProfileLimitModalOpen } = useProfileGuard();

  // Plan and download tracking
  const [userPlan, setUserPlan] = useState('free');
  const [downloadCount, setDownloadCount] = useState(0);
  const [canDownload, setCanDownload] = useState(false);

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfBlob, setPreviewPdfBlob] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Mobile tab state
  const [activeTab, setActiveTab] = useState('form');

  // Export functionality state
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportAmountModal, setShowExportAmountModal] = useState(false);
  const [exportPaymentAmount, setExportPaymentAmount] = useState('');
  const [exportPaymentCurrency, setExportPaymentCurrency] = useState('INR');
  const [exportPaymentError, setExportPaymentError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Additional state variables for compatibility
  const [customColors, setCustomColors] = useState({});
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('in');

  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.error('Please login to continue');
        router.push('/login');
        return;
      }
      setUser(currentUser);
      await loadSavedData(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Monitor user plan and download permissions
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const plan = userData?.plan || 'free';
        const count = userData?.pdf_download_count || 0;

        // Check if user is admin for export functionality
        const adminEmails = ['rahuldubey220890@gmail.com', 'ebupthaan601@gmail.com', 'shilesh.50025@gmail.com', 'gopipandey.dev@gmail.com'];
        setIsAdmin(adminEmails.includes(user.email));

        setUserPlan(plan);
        setDownloadCount(count);

        // Check if user can download
        // Plans: oneDay, basic, premium (premium has billing cycles: monthly, sixMonth, quarterly, yearly)
        const isPaidPlan = ['oneDay', 'basic', 'premium'].includes(plan);
        const isPremiumPlan = plan === 'premium'; // Premium plan has unlimited downloads

        if (!isPaidPlan) {
          // Free users cannot download
          setCanDownload(false);
        } else if (isPremiumPlan) {
          // Premium plan always has unlimited downloads (regardless of billing cycle)
          setCanDownload(true);
        } else {
          // Limited plans (oneDay, basic) - check download limits and expiry
          const planConfig = getPlanConfig(plan);
          if (planConfig && planConfig.downloads !== 'unlimited') {
            const planExpiry = userData?.premium_expiry;
            const isExpired = planExpiry && new Date() >= new Date(planExpiry);
            const hasReachedLimit = count >= planConfig.downloads;

            setCanDownload(!hasReachedLimit && !isExpired);
          } else {
            // Fallback: allow download
            setCanDownload(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load data from URL params, localStorage, or Firestore
  const loadSavedData = async (uid) => {
    try {
      // Check if resumeId is in URL params (editing existing saved resume)
      const resumeId = searchParams.get('resumeId');
      if (resumeId) {
        console.log('[One-Pager] Loading saved resume:', resumeId);
        const docRef = doc(db, 'users', uid, 'resumes', resumeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('[One-Pager] Loaded resume data');

          // Set resume data from saved resume
          setResumeData({
            personal: data.personal || {},
            summary: data.summary || '',
            experience: data.experience || [],
            education: data.education || [],
            skills: data.skills || [],
            projects: data.projects || [],
            certifications: data.certifications || []
          });

          // Set template and other properties
          setSelectedTemplate(data.template || 'classic');
          setCustomColors(data.customColors || {});
          setLanguage(data.language || 'en');
          setCountry(data.country || 'in');

          // Set resume name for re-saving
          setResumeName(data.resumeName || '');

          toast.success('One-pager resume loaded!');
          return;
        } else {
          console.error('[One-Pager] Resume not found:', resumeId);
          toast.error('Resume not found');
        }
      }

      // Check if data passed via URL
      const dataParam = searchParams.get('data');
      if (dataParam) {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setResumeData(parsedData);
        return;
      }

      // Check localStorage for uploaded data
      const localData = localStorage.getItem('onePagerData');
      if (localData) {
        const parsedData = JSON.parse(localData);

        // Auto-enhance content if it looks sparse
        const shouldAutoEnhance = await checkAndAutoEnhance(parsedData);

        if (shouldAutoEnhance) {
          toast.loading('🚀 Auto-enhancing your content for better page utilization...', { id: 'auto-enhance' });
          const enhancedData = await autoEnhanceContent(parsedData);
          setResumeData(enhancedData);
          toast.success('✨ Content enhanced! Your one-pager now utilizes the full page.', { id: 'auto-enhance' });
        } else {
          setResumeData(parsedData);
        }

        localStorage.removeItem('onePagerData'); // Clear after loading
        return;
      }

      // Load from Firestore draft (only on initial load, won't conflict with edits)
      const docRef = doc(db, 'users', uid, 'onePagerResumes', 'draft');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResumeData(docSnap.data().resumeData || resumeData);
        setSelectedTemplate(docSnap.data().template || 'classic');
        console.log('[One-Pager] Loaded draft from auto-save');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Smart auto-save with debounce to ensure AI suggestions are applied first
  useEffect(() => {
    if (!user || loading) return;

    // Skip auto-save if data is empty (initial load)
    const hasData = resumeData.personal?.name || resumeData.summary ||
      resumeData.experience?.length > 0;
    if (!hasData) return;

    // Debounce auto-save: wait 2 seconds after last change
    const saveTimer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [resumeData, selectedTemplate, user, loading]);

  const handleAutoSave = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid, 'onePagerResumes', 'draft');
      await setDoc(docRef, {
        resumeData,
        template: selectedTemplate,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('[Auto-save] Draft saved successfully');
    } catch (error) {
      console.error('[Auto-save] Error:', error);
    }
  };

  const handleSaveClick = () => {
    // Suggest a name based on user's name or job title
    const suggestedName = resumeData.personal?.name
      ? `${resumeData.personal.name} - One Pager`
      : resumeData.personal?.jobTitle
        ? `${resumeData.personal.jobTitle} Resume`
        : 'My One-Pager Resume';

    setResumeName(suggestedName);
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!user || !resumeName.trim()) {
      toast.error('Please enter a resume name');
      return;
    }

    setSaving(true);
    setShowSaveModal(false);

    try {
      // Check if we're editing an existing resume or creating a new one
      const existingResumeId = searchParams.get('resumeId');

      // Generate unique identifier for one-pager resumes
      let resumeId;
      if (existingResumeId) {
        // Keep existing ID for updates
        resumeId = existingResumeId;
      } else {
        // Generate new unique ID with timestamp and random component
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        resumeId = `onepager_${timestamp}_${randomSuffix}`;
      }

      // Prepare resume data with proper one-pager identification
      const resumeDataToSave = {
        ...resumeData,
        resumeName: resumeName.trim(),
        template: selectedTemplate,
        // Multiple identifiers to ensure proper detection
        isOnePager: true,
        resumeType: 'one-pager',
        onePagerId: resumeId, // Additional unique identifier
        builderType: 'one-pager-builder', // Track which builder created this
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        // Add metadata for better identification
        metadata: {
          createdBy: 'one-pager-builder',
          version: '1.0',
          uniqueId: resumeId
        }
      };

      // Only add createdAt for new resumes
      if (!existingResumeId) {
        resumeDataToSave.createdAt = new Date().toISOString();
      }

      // Save to the regular resumes collection with metadata
      const docRef = doc(db, 'users', user.uid, 'resumes', resumeId);
      await setDoc(docRef, resumeDataToSave, { merge: existingResumeId ? true : false });

      console.log('One-pager resume saved with ID:', resumeId);

      const action = existingResumeId ? 'updated' : 'saved';
      toast.success(`"${resumeName.trim()}" ${action} successfully!`);

      // Redirect to my-resumes after a delay
      setTimeout(() => {
        router.push('/my-resumes');
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!user) {
      toast.error('Please login to preview');
      return;
    }

    // Profile Ownership Check using useProfileGuard
    // Transform data structure to match what checkProfileAccess expects (name at root level)
    const profileCheckData = {
      name: resumeData?.personal?.name,
      email: resumeData?.personal?.email,
      phone: resumeData?.personal?.phone
    };

    const loadingId = toast.loading("Verifying profile access...");
    try {
      const { allowed, needsUpgrade, inProgress } = await checkProfileAccess(
        user,
        profileCheckData,
        "one_pager_preview"
      );

      if (inProgress) return;

      toast.dismiss(loadingId);
      if (!allowed) {
        if (needsUpgrade) {
          // Modal will be shown by useProfileGuard for upgrade flow
        }
        return; // Guard modal takes over
      }
    } catch (error) {
      toast.dismiss(loadingId);
      console.error("Profile check failed", error);
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Generate PDF preview
      const response = await fetch('/api/download-one-pager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: resumeData,
          template: selectedTemplate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setPreviewPdfBlob(blob);
      setPreviewPdfUrl(url);
      setShowPreviewModal(true);

      // Track preview event
      event({
        action: 'preview_one_pager',
        category: 'OnePager',
        label: 'PreviewGenerated',
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(error.message || 'Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error('Please login to download');
      return;
    }

    // Profile Ownership Check using useProfileGuard
    // Transform data structure to match what checkProfileAccess expects (name at root level)
    const profileCheckData = {
      name: resumeData?.personal?.name,
      email: resumeData?.personal?.email,
      phone: resumeData?.personal?.phone
    };

    const loadingId = toast.loading("Verifying profile access...");
    try {
      const { allowed, needsUpgrade, inProgress } = await checkProfileAccess(
        user,
        profileCheckData,
        "one_pager_download"
      );

      if (inProgress) return;

      toast.dismiss(loadingId);
      if (!allowed) {
        if (needsUpgrade) {
          // Modal will be shown by useProfileGuard for upgrade flow
        }
        return; // Guard modal takes over
      }
    } catch (error) {
      toast.dismiss(loadingId);
      console.error("Profile check failed", error);
      return;
    }

    setDownloading(true);
    try {
      // Fetch user data to check plan and download limits
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      const plan = userData?.plan || 'free';
      const pdfDownloadCount = userData?.pdf_download_count || 0;

      // Check if user is on a paid plan
      const isPaidPlan = ['oneDay', 'basic', 'premium'].includes(plan);

      if (!isPaidPlan) {
        toast.error('One-pager download requires a paid plan. Upgrade to continue!');
        router.push('/pricing');
        return;
      }

      // Check download limits for oneDay and basic plans using planConfig
      const planConfig = getPlanConfig(plan);
      if (planConfig && planConfig.downloads !== 'unlimited') {
        const downloadLimit = planConfig.downloads;

        // Check if plan has expired
        const planExpiry = userData?.premium_expiry;
        const isExpired = planExpiry && new Date() >= new Date(planExpiry);

        if (pdfDownloadCount >= downloadLimit || isExpired) {
          const message = getDownloadLimitMessage(plan, isExpired);
          toast.error(message);
          router.push('/pricing');
          return;
        }
      }

      // Generate PDF using new API
      const response = await fetch('/api/download-one-pager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: resumeData,
          template: selectedTemplate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personal?.name?.replace(/\s+/g, '_') || 'Resume'}_OnePager.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Increment download count for plans with limits
      if (planConfig && planConfig.downloads !== 'unlimited') {
        await setDoc(userDocRef, {
          pdf_download_count: pdfDownloadCount + 1
        }, { merge: true });

        const remaining = planConfig.downloads - (pdfDownloadCount + 1);
        toast.success(`Resume downloaded! ${remaining} downloads remaining.`);
      } else {
        toast.success('Resume downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download PDF');
      setDownloading(false);
    }
  };

  const handleInitiateExport = () => {
    if (!isAdmin) {
      toast.error('Export feature is only available for admin users');
      return;
    }

    setExportPaymentError('');
    setExportPaymentAmount('0'); // Default to free
    setExportPaymentCurrency('INR');
    setShowExportAmountModal(true);
  };

  const handleExportOnePager = async (paymentAmountValue = 0, paymentCurrencyValue = 'INR') => {
    if (!user || !isAdmin) {
      toast.error('Admin access required');
      return false;
    }

    try {
      setIsExporting(true);

      const token = await user.getIdToken();

      // Get current resumeId if editing existing resume
      const resumeId = searchParams.get('resumeId');

      const response = await fetch('/api/export-one-pager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          template: selectedTemplate,
          customColors,
          language,
          country,
          resumeName: resumeData.personal?.name ? `${resumeData.personal.name} - One-Pager` : 'One-Pager Resume',
          resumeId,
          paymentAmount: paymentAmountValue,
          paymentCurrency: paymentCurrencyValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export one-pager');
      }

      const data = await response.json();
      setExportedUrl(data.hostedUrl);
      setShowExportModal(true);

      toast.success('One-pager exported successfully! Updates to this resume will automatically reflect in the hosted link.');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export one-pager. Please try again.');
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmExport = async () => {
    const amountToCharge = exportPaymentAmount === '' ? 0 : parseFloat(exportPaymentAmount);

    if (isNaN(amountToCharge) || amountToCharge < 0) {
      setExportPaymentError('Please enter a valid amount (0 or more).');
      return;
    }

    setExportPaymentError('');
    const success = await handleExportOnePager(amountToCharge, exportPaymentCurrency || 'INR');
    if (success) {
      setShowExportAmountModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00C4B3] mx-auto mb-4" />
          <p className="text-gray-600">Loading your one-pager builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-white/95 backdrop-blur border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <button
            onClick={() => router.push('/one-pager-builder')}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-xl font-bold text-gray-900 truncate">One-Pager Resume Builder</h1>
            <p className="text-xs text-gray-500 hidden sm:block">All content must fit on one page</p>
          </div>
        </div>

        {/* Desktop Actions - Professional Design */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="group flex items-center h-10 px-4 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-sm font-medium"
          >
            <LayoutGrid size={16} className="mr-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
            <span>Templates</span>
          </button>

          <button
            onClick={handlePreview}
            disabled={isGeneratingPreview}
            className="group flex items-center h-10 px-4 bg-gradient-to-r from-[#00C4B3]/5 to-[#0B1F3B]/5 text-[#0B1F3B] rounded-lg border border-[#00C4B3]/20 hover:border-[#00C4B3]/30 hover:shadow-md hover:shadow-[#00C4B3]/10 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPreview ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Eye size={16} className="mr-2 text-[#00C4B3] group-hover:text-[#00C4B3]/80 transition-colors" />
                <span>Preview PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleSaveClick}
            disabled={saving}
            className="group flex items-center h-10 px-4 bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 text-[#0B1F3B] rounded-lg border border-[#00C4B3]/20 hover:border-[#00C4B3]/30 hover:shadow-md hover:shadow-[#00C4B3]/10 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2 text-[#0B1F3B] group-hover:text-[#00C4B3] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Export Button - Admin Only */}
          {isAdmin && (
            <button
              onClick={handleInitiateExport}
              disabled={isExporting}
              className="group flex items-center h-10 px-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg border border-green-200 hover:border-green-300 hover:shadow-md hover:shadow-green-100 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Hosted Preview"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 text-green-600 group-hover:text-green-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Export</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              // Check if premium plan - always allow download
              const isPremiumPlan = userPlan === 'premium';

              if (isPremiumPlan || canDownload) {
                handleDownload();
              } else {
                // Show appropriate message based on why they can't download
                if (userPlan === 'free') {
                  toast.error('One-pager download requires a paid plan. Upgrade to continue!');
                } else {
                  // User is on a limited plan and has reached their limit
                  const planConfig = getPlanConfig(userPlan);
                  if (planConfig && planConfig.downloads !== 'unlimited') {
                    const message = getDownloadLimitMessage(userPlan, false);
                    toast.error(message, { duration: 5000 });
                  }
                }
                router.push('/pricing');
              }
            }}
            disabled={downloading}
            className={`group flex items-center h-10 px-5 rounded-lg font-semibold transition-all duration-200 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${(() => {
              const isPremiumPlan = userPlan === 'premium';
              return (isPremiumPlan || canDownload)
                ? 'bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] hover:opacity-90 text-white hover:shadow-lg hover:shadow-[#00C4B3]/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-amber-200 cursor-pointer';
            })()
              }`}
            title={(() => {
              const isPremiumPlan = userPlan === 'premium';
              if (isPremiumPlan) return '';
              return !canDownload ? (userPlan === 'free' ? 'Requires paid plan' : 'Download limit reached') : '';
            })()}
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden text-xs">Generating...</span>
              </>
            ) : (() => {
              // Check if user is on premium (unlimited) plan
              const isPremiumPlan = userPlan === 'premium';

              if (isPremiumPlan) {
                return (
                  <>
                    <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden text-xs">Download</span>
                  </>
                );
              } else if (canDownload) {
                return (
                  <>
                    <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      Download PDF
                      {userPlan === 'oneDay' && downloadCount < getPlanConfig('oneDay').downloads && ` (${getPlanConfig('oneDay').downloads - downloadCount} left)`}
                      {userPlan === 'basic' && downloadCount < getPlanConfig('basic').downloads && ` (${getPlanConfig('basic').downloads - downloadCount} left)`}
                    </span>
                    <span className="sm:hidden text-xs">
                      Download
                      {userPlan === 'oneDay' && downloadCount < getPlanConfig('oneDay').downloads && ` (${getPlanConfig('oneDay').downloads - downloadCount} left)`}
                      {userPlan === 'basic' && downloadCount < getPlanConfig('basic').downloads && ` (${getPlanConfig('basic').downloads - downloadCount} left)`}
                    </span>
                  </>
                );
              } else if (userPlan === 'free') {
                return (
                  <>
                    <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Get Premium</span>
                    <span className="sm:hidden text-xs">Get Premium</span>
                  </>
                );
              } else {
                return (
                  <>
                    <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Download Limit Reached - Upgrade</span>
                    <span className="sm:hidden text-xs">Limit Reached</span>
                  </>
                );
              }
            })()}
          </button>
        </div>
      </header>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Save Resume</h2>
              <p className="text-sm text-gray-600 mt-1">Give your one-pager resume a name</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Name
              </label>
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && resumeName.trim()) {
                    handleSaveConfirm();
                  }
                }}
                placeholder="e.g., John Doe - One Pager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                This will be saved to your "My Resumes" page
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={!resumeName.trim()}
                className="px-6 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#0B1F3B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Amount Modal */}
      {showExportAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Set Payment Amount
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter the amount to charge before the user can download this one-pager. Leave blank or enter 0 to allow free downloads.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({exportPaymentCurrency || 'INR'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={exportPaymentAmount}
                  onChange={(e) => setExportPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {exportPaymentError && (
                <p className="text-sm text-red-600">{exportPaymentError}</p>
              )}
              {exportPaymentAmount !== '' && (
                <p className="text-xs text-gray-500">
                  Charge amount preview:{' '}
                  <span className="font-medium text-gray-900">
                    {exportPaymentCurrency} {parseFloat(exportPaymentAmount || 0).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (isExporting) return;
                  setShowExportAmountModal(false);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export One-Pager'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Success Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              One-Pager Exported Successfully!
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Your one-pager has been exported to a hosted preview page. You can now control download permissions from the admin dashboard.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-2">Hosted URL:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={exportedUrl}
                  readOnly
                  className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportedUrl);
                    toast.success('URL copied to clipboard!');
                  }}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <a
                href={exportedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                View Hosted One-Pager
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-y-auto relative">
            {/* Close Button - Absolute positioned outside the scroll area */}
            <button
              onClick={() => setShowTemplates(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-20 border-2 border-gray-200"
              title="Close"
            >
              <X size={24} className="text-gray-700" />
            </button>

            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
                <p className="text-sm text-gray-600 mt-1">Select a professional one-pager design</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`group relative rounded-xl overflow-hidden transition-all hover:shadow-2xl ${selectedTemplate === template.id
                    ? 'ring-4 ring-[#00C4B3] shadow-xl'
                    : 'hover:ring-2 hover:ring-[#00C4B3]/30'
                    }`}
                >
                  {/* Template Preview Image */}
                  <div className="aspect-[8.5/11] bg-white overflow-hidden relative cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowTemplates(false);
                      toast.success(`✓ ${template.name} selected!`);
                    }}
                  >
                    <Image
                      src={`/templates/onepager-previews/${template.id}.png?v=2024`}
                      alt={template.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={95}
                      priority={template.id === 'classic'}
                      unoptimized
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#00C4B3] bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none" />

                    {/* Zoom Icon Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedTemplate(template);
                      }}
                      className="absolute top-3 left-3 bg-white text-gray-700 p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 z-20"
                      title="View full size"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>

                    {/* Selected Badge */}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-3 right-3 bg-[#0B1F3B] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className={`p-4 ${selectedTemplate === template.id ? 'bg-[#00C4B3]/5' : 'bg-gray-50'
                    }`}>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Template Lightbox */}
      {zoomedTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setZoomedTemplate(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setZoomedTemplate(null)}
              className="absolute -top-12 right-0 bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors shadow-lg z-10"
              title="Close"
            >
              <X size={24} />
            </button>

            {/* Template Info Header */}
            <div className="bg-white rounded-t-xl p-4 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{zoomedTemplate.name}</h3>
              <p className="text-sm text-gray-600">{zoomedTemplate.description}</p>
            </div>

            {/* Zoomed Image Container */}
            <div
              className="bg-white rounded-b-xl p-4 overflow-auto flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ minHeight: '800px' }}>
                <Image
                  src={`/templates/onepager-previews/${zoomedTemplate.id}.png?v=2024`}
                  alt={zoomedTemplate.name}
                  width={850}
                  height={1100}
                  className="w-full h-auto shadow-2xl"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTemplate(zoomedTemplate.id);
                setZoomedTemplate(null);
                setShowTemplates(false);
                toast.success(`✓ ${zoomedTemplate.name} selected!`);
              }}
              className="mt-4 w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Select This Template
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Navigation - Only visible on mobile */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'form'
            ? 'text-[#0B1F3B] border-b-2 border-[#00C4B3] bg-[#00C4B3]/5'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Edit size={14} />
            <span className="text-xs">Edit Resume</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'preview'
            ? 'text-[#0B1F3B] border-b-2 border-[#00C4B3] bg-[#00C4B3]/5'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Eye size={14} />
            <span className="text-xs">Preview</span>
          </div>
        </button>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-20 lg:pb-0">
        {/* Form Section */}
        <div className={`${
          // Mobile: Full width with tab switching
          activeTab === 'form' ? 'flex' : 'hidden'
          } lg:flex lg:w-1/2 border-r border-gray-200 overflow-hidden`}>
          <OnePagerResumeFormAI
            data={resumeData}
            onChange={setResumeData}
            userId={user?.uid}
            resumeId={searchParams.get('resumeId')}
            userPlan={userPlan}
          />
        </div>

        {/* Preview Section */}
        <div className={`${
          // Mobile: Full width with tab switching
          activeTab === 'preview' ? 'flex' : 'hidden'
          } lg:flex lg:w-1/2 overflow-hidden`}>
          <OnePagerPreview
            data={resumeData}
            template={selectedTemplate}
            customColors={customColors}
            language={language}
            country={country}
          />
        </div>
      </div>

      {/* Premium PDF Preview Modal */}
      {showPreviewModal && (
        <PremiumPdfPreview
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            if (previewPdfUrl) {
              window.URL.revokeObjectURL(previewPdfUrl);
              setPreviewPdfUrl(null);
              setPreviewPdfBlob(null);
            }
          }}
          pdfPreviewUrl={previewPdfUrl}
          pdfPreviewBlob={previewPdfBlob}
          isPremium={userPlan === 'premium'}
          user={user}
          handleUpgradeClick={(plan) => {
            router.push('/pricing');
          }}
          event={event}
          toast={toast}
        />
      )}

      {/* Mobile Bottom Bar - mirrors Resume Builder UX */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
        <div className="mx-2 mb-2 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-[0_6px_30px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            {/* Templates */}
            <button
              onClick={() => setShowTemplates(true)}
              className="h-12 flex flex-col items-center justify-center text-[11px] font-medium text-gray-700 hover:bg-gray-50 rounded-l-2xl"
            >
              <LayoutGrid size={16} className="mb-0.5" />
              Templates
            </button>

            {/* Preview */}
            <button
              onClick={handlePreview}
              disabled={isGeneratingPreview}
              className="h-12 flex flex-col items-center justify-center text-[11px] font-medium text-[#0B1F3B] hover:bg-[#00C4B3]/5 disabled:opacity-50"
            >
              {isGeneratingPreview ? (
                <Loader2 size={16} className="mb-0.5 animate-spin" />
              ) : (
                <Eye size={16} className="mb-0.5" />
              )}
              Preview
            </button>

            {/* Save */}
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="h-12 flex flex-col items-center justify-center text-[11px] font-medium text-[#0B1F3B] hover:bg-[#00C4B3]/5 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="mb-0.5 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM7 5h8v4H7V5zm5 14a3 3 0 110-6 3 3 0 010 6z" /></svg>
              )}
              Save
            </button>

            {/* Download / Get Premium */}
            <button
              onClick={() => {
                const isPremiumPlan = userPlan === 'premium';
                if (isPremiumPlan || canDownload) {
                  handleDownload();
                } else {
                  router.push('/pricing');
                }
              }}
              disabled={downloading}
              className={`h-12 flex flex-col items-center justify-center text-[11px] font-semibold rounded-r-2xl ${(() => {
                const isPremiumPlan = userPlan === 'premium';
                return (isPremiumPlan || canDownload)
                  ? 'text-[#0B1F3B] hover:bg-[#00C4B3]/5'
                  : 'text-amber-700 hover:bg-amber-50';
              })()}`}
            >
              {downloading ? (
                <Loader2 size={16} className="mb-0.5 animate-spin" />
              ) : (
                <Download size={16} className="mb-0.5" />
              )}
              {(() => {
                const isPremiumPlan = userPlan === 'premium';
                if (isPremiumPlan) return 'Download';
                return canDownload ? 'Download' : 'Get Premium';
              })()}
            </button>
          </div>
        </div>
      </div>
      <ProfileGuardModal />
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#00C4B3] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading one-pager editor...</p>
        </div>
      </div>
    </div>
  );
}

// Main export wrapped in Suspense
export default function OnePagerEditor() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnePagerEditorContent />
    </Suspense>
  );
}
