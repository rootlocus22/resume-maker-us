"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Upload,
  ArrowRight,
  CheckCircle,
  Edit,
  Plus,
  Calendar,
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import OnePagerSkeleton from '../components/OnePagerSkeleton';

export default function OnePagerBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onePagerResumes, setOnePagerResumes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadOnePagerResumes(currentUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load one-pager resumes
  const loadOnePagerResumes = async (uid) => {
    try {
      const resumesRef = collection(db, 'users', uid, 'resumes');

      // Get all resumes and filter client-side to catch all one-pager resumes
      const querySnapshot = await getDocs(resumesRef);

      const resumes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docId = doc.id;

        // Check if this is a one-pager resume using multiple criteria
        const isOnePager =
          data.isOnePager === true ||
          data.resumeType === 'one-pager' ||
          data.builderType === 'one-pager-builder' ||
          data.onePagerId ||
          docId.startsWith('onepager_') ||
          (data.metadata && data.metadata.createdBy === 'one-pager-builder') ||
          (data.personal && typeof data.personal === 'object' && !data.name); // One-pager structure

        if (isOnePager) {
          resumes.push({
            id: docId,
            ...data
          });
        }
      });

      // Sort by updatedAt or createdAt
      resumes.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      console.log('Loaded one-pager resumes:', resumes.length, resumes);
      setOnePagerResumes(resumes);
    } catch (error) {
      console.error('Error loading one-pager resumes:', error);
      toast.error('Failed to load saved resumes');
    }
  };

  const handleEditResume = (resumeId) => {
    if (!user) {
      toast.error('Please sign in to edit your resume');
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    router.push(`/one-pager-builder/editor?resumeId=${resumeId}`);
  };

  const handleStartFromScratch = () => {
    if (!user) {
      toast.error('Please sign in to create a resume');
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    router.push('/one-pager-builder/editor');
  };

  const handleUploadResume = async (event) => {
    if (!user) {
      toast.error('Please sign in to upload a resume');
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert-to-one-pager', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process resume');
      }

      const data = await response.json();

      // Store the processed data and redirect to editor
      localStorage.setItem('onePagerData', JSON.stringify(data));
      router.push('/one-pager-builder/editor');

      toast.success('Resume processed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <OnePagerSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              One-Page Resume Builder
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Saved Resumes Section */}
        {onePagerResumes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Saved Resumes ({onePagerResumes.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onePagerResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00C4B3]/30 hover:shadow-md transition-all duration-200 p-5 cursor-pointer group"
                  onClick={() => handleEditResume(resume.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#00C4B3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-[#00C4B3]" size={24} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(resume.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {resume.template || 'Classic'}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#00C4B3] transition-colors truncate">
                    {resume.resumeName || resume.personal?.name || 'Untitled Resume'}
                  </h3>

                  {(resume.personal?.name || resume.name) && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{resume.personal?.name || resume.name}</span>
                    </div>
                  )}

                  <div className="space-y-1 mb-4">
                    {(resume.personal?.jobTitle || resume.jobTitle) && (
                      <div className="text-sm text-gray-600 truncate">
                        {resume.personal?.jobTitle || resume.jobTitle}
                      </div>
                    )}
                    {(resume.personal?.email || resume.email) && (
                      <div className="text-xs text-gray-500 truncate">
                        {resume.personal?.email || resume.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-[#00C4B3] font-medium text-sm">
                      <Edit size={14} className="mr-2" />
                      <span>Edit</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-[#00C4B3] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New One-Page Resume
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start from Scratch */}
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00C4B3]/30 hover:shadow-md transition-all duration-200 p-6 cursor-pointer group"
              onClick={handleStartFromScratch}
            >
              <div className="w-14 h-14 bg-[#00C4B3]/10 rounded-xl flex items-center justify-center mb-4">
                <Plus className="text-[#00C4B3]" size={28} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start from Scratch</h3>
              <p className="text-gray-600 text-sm mb-4">
                Build your one-page resume from the ground up with our optimized editor.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>Character-limited fields</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>Real-time preview</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>6 optimized templates</span>
                </div>
              </div>

              <div className="flex items-center text-[#00C4B3] font-medium text-sm pt-4 border-t border-gray-100 group-hover:translate-x-1 transition-transform">
                <span>Start Building</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            {/* Upload Resume */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#00C4B3]/30 hover:shadow-md transition-all duration-200 p-6 group">
              <div className="w-14 h-14 bg-[#00C4B3]/10 rounded-xl flex items-center justify-center mb-4">
                <Upload className="text-[#00C4B3]" size={28} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload your existing resume and we'll convert it into a one-page format.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>PDF support</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>AI-powered conversion</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-600 mr-2 flex-shrink-0" />
                  <span>Smart content optimization</span>
                </div>
              </div>

              <label className="block pt-4 border-t border-gray-100">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleUploadResume}
                  disabled={isUploading}
                  className="hidden"
                />
                <div className="flex items-center justify-center bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer text-sm">
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      <span>Choose File</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}