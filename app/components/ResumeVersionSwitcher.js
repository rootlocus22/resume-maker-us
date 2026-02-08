"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Check,
  X,
  Star,
  BarChart3,
  Clock,
  FileText,
  Briefcase,
  Award,
  Cloud,
  HardDrive
} from "lucide-react";
import {
  getResumeVersions,
  getActiveResumeVersion,
  setActiveResumeVersion,
  createResumeVersion,
  updateResumeVersion,
  deleteResumeVersion,
  duplicateResumeVersion,
  getResumeVersionSummary,
  initializeResumeVersions,
  clearWorkingResume,
  clearActiveResumeMarker,
  saveResumeVersions,
  DEFAULT_RESUME_DATA
} from "../lib/storage";
import { collection, getDocs, doc, deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import toast from "react-hot-toast";

export default function ResumeVersionSwitcher({ onVersionChange, currentResumeData, currentMetadata, user, hasUnsavedChanges, onUnsavedChangesCheck }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState({});
  const [savedResumes, setSavedResumes] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState("");
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load versions and resumes on mount
  useEffect(() => {
    initializeResumeVersions();
    loadData();
  }, [user]);

  // Add real-time listener for Firestore changes
  useEffect(() => {
    if (!user) return;

    let unsubscribeSnapshot = null;
    
    try {
      const resumesRef = collection(db, "users", user.uid, "resumes");
      unsubscribeSnapshot = onSnapshot(resumesRef, (snapshot) => {
        const resumeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'firestore',
          ...doc.data(),
        }));
        
        // Filter out one-pager resumes - they're handled in the dedicated one-pager UI
        const filteredResumeList = resumeList.filter(resume => {
          const isOnePager = 
            resume.isOnePager === true || 
            resume.resumeType === 'one-pager' || 
            resume.builderType === 'one-pager-builder' ||
            resume.onePagerId ||
            resume.id.startsWith('onepager_') ||
            (resume.metadata && resume.metadata.createdBy === 'one-pager-builder') ||
            (resume.personal && typeof resume.personal === 'object' && !resume.name); // One-pager structure
          
          // Debug logging for real-time listener
          if (isOnePager) {
            console.log("🚫 Real-time listener filtering out one-pager resume:", {
              id: resume.id,
              resumeName: resume.resumeName,
              isOnePager: resume.isOnePager,
              resumeType: resume.resumeType,
              builderType: resume.builderType,
              onePagerId: resume.onePagerId,
              metadata: resume.metadata,
              hasPersonalStructure: resume.personal && typeof resume.personal === 'object' && !resume.name
            });
          }
          
          return !isOnePager; // Keep only non-one-pager resumes
        });
        
        console.log("📊 Real-time listener filtering results:", {
          totalResumes: resumeList.length,
          filteredResumes: filteredResumeList.length,
          filteredOut: resumeList.length - filteredResumeList.length
        });
        
        setSavedResumes(filteredResumeList);
        
        // Don't load any local versions - only show Firestore resumes
        setVersions({});
      });
    } catch (error) {
      console.error("Error setting up real-time listener:", error);
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    // Only load Firestore saved resumes if user is logged in
    if (user) {
      try {
        const resumesRef = collection(db, "users", user.uid, "resumes");
        const snapshot = await getDocs(resumesRef);
        const resumeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: 'firestore',
          ...doc.data(),
        }));
        
        // Filter out one-pager resumes - they're handled in the dedicated one-pager UI
        const filteredResumeList = resumeList.filter(resume => {
          const isOnePager = 
            resume.isOnePager === true || 
            resume.resumeType === 'one-pager' || 
            resume.builderType === 'one-pager-builder' ||
            resume.onePagerId ||
            resume.id.startsWith('onepager_') ||
            (resume.metadata && resume.metadata.createdBy === 'one-pager-builder') ||
            (resume.personal && typeof resume.personal === 'object' && !resume.name); // One-pager structure
          
          // Debug logging to understand inconsistent behavior
          if (isOnePager) {
            console.log("🚫 Filtering out one-pager resume from ResumeVersionSwitcher:", {
              id: resume.id,
              resumeName: resume.resumeName,
              isOnePager: resume.isOnePager,
              resumeType: resume.resumeType,
              builderType: resume.builderType,
              onePagerId: resume.onePagerId,
              metadata: resume.metadata,
              hasPersonalStructure: resume.personal && typeof resume.personal === 'object' && !resume.name
            });
          }
          
          return !isOnePager; // Keep only non-one-pager resumes
        });
        
        console.log("📊 ResumeVersionSwitcher filtering results:", {
          totalResumes: resumeList.length,
          filteredResumes: filteredResumeList.length,
          filteredOut: resumeList.length - filteredResumeList.length
        });
        
        setSavedResumes(filteredResumeList);
        
        // Don't load any local versions - only show Firestore resumes
        setVersions({});
      } catch (error) {
        console.error("Error loading saved resumes:", error);
        setSavedResumes([]);
        setVersions({});
      }
    } else {
      setSavedResumes([]);
      setVersions({});
    }
    
    setLoading(false);
  };

  const handleVersionSwitch = (item) => {
    // Check for unsaved changes before switching
    if (hasUnsavedChanges && onUnsavedChangesCheck) {
      const shouldProceed = onUnsavedChangesCheck(() => {
        // This callback will be called if user chooses to proceed
        performVersionSwitch(item);
      });
      if (!shouldProceed) {
        return; // Don't proceed if user cancels
      }
    } else {
      // No unsaved changes, proceed directly
      performVersionSwitch(item);
    }
  };

  const performVersionSwitch = (item) => {
    if (item.type === 'firestore') {
      // Handle Firestore resume - use the same logic as my-resume page
      // Instead of trying to load data directly, navigate to resume-builder with resumeId
      
      // Navigate to resume-builder with the resumeId and template
      const url = `/resume-builder?resumeId=${item.id}&template=${item.template || 'classic'}`;
      router.push(url);
      
      // Don't show success toast here - let ResumeBuilder handle it
      setIsOpen(false);
    } else {
      // Handle local version
      setActiveResumeVersion(item.id);
      setActiveVersionId(item.id);
      
      const versionData = versions[item.id];
      if (versionData && onVersionChange) {
        onVersionChange(versionData.data, versionData.metadata);
      }
      
      toast.success(`Switched to "${item.name}"`);
      setIsOpen(false);
    }
  };



  const handleStartFresh = () => {
    // Check for unsaved changes before starting fresh
    if (hasUnsavedChanges && onUnsavedChangesCheck) {
      const shouldProceed = onUnsavedChangesCheck(() => {
        // This callback will be called if user chooses to proceed
        performStartFresh();
      });
      if (!shouldProceed) {
        return; // Don't proceed if user cancels
      }
    } else {
      // No unsaved changes, proceed directly
      performStartFresh();
    }
  };

  const performStartFresh = () => {
    // Set flag to indicate user wants to start fresh
    localStorage.setItem('startFreshResume', 'true');
    
    // Clear the resumeId from URL to start fresh
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('resumeId');
    currentUrl.searchParams.delete('template');
    window.history.replaceState({}, '', currentUrl.toString());
    
    // Create a fresh resume version with default data
    const freshVersionId = createResumeVersion(
      "Fresh Resume",
      { ...DEFAULT_RESUME_DATA },
      {
        template: "classic",
        preferences: {},
        customColors: {},
        language: "en",
        country: "us"
      }
    );
    
    if (freshVersionId) {
      setActiveResumeVersion(freshVersionId);
      setActiveVersionId(freshVersionId);
      loadData();
    }
    
    if (onVersionChange) {
      onVersionChange({ ...DEFAULT_RESUME_DATA }, {
        template: "classic",
        preferences: {},
        customColors: {},
        language: "en",
        country: "us"
      });
    }
    
    toast.success("Started fresh resume");
    setIsOpen(false);
  };

  const handleDuplicateVersion = (versionId, e) => {
    e.stopPropagation();
    const version = versions[versionId];
    if (version) {
      const newVersionId = duplicateResumeVersion(versionId, `${version.name} (Copy)`);
      if (newVersionId) {
        loadData();
        toast.success(`Duplicated "${version.name}"`);
      }
    }
  };

  const handleDeleteVersion = (versionId, e) => {
    e.stopPropagation();
    const version = versions[versionId];
    if (version && Object.keys(versions).length > 1) {
      deleteResumeVersion(versionId);
      loadData();
      toast.success(`Deleted "${version.name}"`);
    }
  };

  const handleDeleteFirestoreResume = async (resumeId, resumeName, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to delete resumes");
      return;
    }

    try {
      const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
      await deleteDoc(resumeRef);
      loadData(); // Refresh the list
      toast.success(`Deleted "${resumeName}"`);
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    }
  };

  const handleRenameVersion = (versionId, newName) => {
    if (!newName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }
    
    updateResumeVersion(versionId, { name: newName.trim() });
    loadData();
    setEditingVersionId(null);
    setEditingName("");
    toast.success(`Renamed to "${newName}"`);
  };

  const startEditing = (versionId, currentName, e) => {
    e.stopPropagation();
    setEditingVersionId(versionId);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingVersionId(null);
    setEditingName("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getATSScoreColor = (score) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Only show Firestore resumes - no local versions
  const allItems = savedResumes.map(resume => ({
    id: resume.id,
    type: 'firestore',
    displayName: resume.resumeName || resume.resumeData?.name || "Saved Resume",
    lastUpdated: resume.updatedAt || new Date().toISOString(),
    atsScore: resume.stats?.atsScore || "N/A",
    template: resume.template || "classic",
    resumeData: resume.resumeData,
    metadata: {
      template: resume.template,
      preferences: resume.preferences,
      customColors: resume.customColors,
      language: resume.language,
      country: resume.country,
      firestoreId: resume.id
    },
    stats: resume.stats || {},
    name: resume.resumeName || resume.resumeData?.name || "Saved Resume"
  })).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  const activeVersion = versions[activeVersionId];
  const activeDisplayName = activeVersion?.name || (savedResumes.length > 0 ? savedResumes[0].resumeName || savedResumes[0].resumeData?.name || "Saved Resume" : "My Resume");

  // Don't render anything for anonymous users
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Trigger Button - Compact Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm min-w-0 flex-shrink-0 h-9 w-[100px]"
      >
        <FileText size={14} className="text-blue-600 flex-shrink-0" />
        <span className="flex-1 truncate text-center">
          {activeDisplayName}
        </span>
        <ChevronDown 
          size={12} 
          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel - Enhanced Mobile Positioning */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile-specific positioning */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-2 right-2 top-16 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-[80vh] overflow-hidden md:absolute md:top-full md:mt-2 md:left-0 md:right-auto md:w-72 md:max-w-[288px]"
            >
              {/* Header - Compact */}
              <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">My Resumes</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartFresh();
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                    >
                      <Plus size={12} />
                      <span className="hidden sm:inline">New Resume</span>
                      <span className="sm:hidden">Fresh</span>
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-700 text-xs font-medium px-2 py-1 rounded hover:bg-gray-50 md:hidden"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>



              {/* Items List - Mobile Optimized */}
              <div className="max-h-[60vh] md:max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-xs">Loading...</p>
                  </div>
                ) : allItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No resumes found</p>
                    <p className="text-xs opacity-75">Create your first resume!</p>
                  </div>
                ) : (
                  allItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group ${
                        item.type === 'local' && item.id === activeVersionId ? 'bg-blue-50 border-blue-100' : ''
                      }`}
                      onClick={() => handleVersionSwitch(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Item Name - Compact */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {editingVersionId === item.id && item.type === 'local' ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameVersion(item.id, editingName);
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-1">
                                  {item.type === 'local' ? (
                                    <div className="flex items-center gap-0.5">
                                      <HardDrive size={11} className="text-blue-600" title="Local Version" />
                                      {item.metadata?.firestoreId && (
                                        <Cloud size={9} className="text-blue-400" title="Synced from Saved Resume" />
                                      )}
                                    </div>
                                  ) : (
                                    <Cloud size={11} className="text-blue-600" title="Saved Resume" />
                                  )}
                                  <span 
                                    className={`font-medium text-xs block truncate max-w-[160px] ${
                                      item.type === 'local' && item.id === activeVersionId ? 'text-blue-700' : 'text-gray-800'
                                    }`}
                                    title={item.displayName}
                                  >
                                    {item.displayName}
                                  </span>
                                  {item.type === 'local' && item.id === activeVersionId && (
                                    <Star size={11} className="text-blue-600 fill-current" />
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Item Stats - Compact */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <div className="flex items-center gap-0.5">
                              <BarChart3 size={10} />
                              <span className={getATSScoreColor(item.atsScore)}>
                                {item.atsScore || 'N/A'}
                              </span>
                            </div>
                            {item.type === 'local' && (
                              <>
                                <div className="flex items-center gap-0.5">
                                  <Briefcase size={10} />
                                  <span>{item.data?.experience?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Award size={10} />
                                  <span>{item.data?.skills?.length || 0}</span>
                                </div>
                              </>
                            )}
                            {item.type === 'firestore' && (
                              <>
                                <div className="flex items-center gap-0.5">
                                  <Briefcase size={10} />
                                  <span>{item.resumeData?.experience?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Award size={10} />
                                  <span>{item.resumeData?.skills?.length || 0}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Last Updated - Compact */}
                          <div className="flex items-center gap-0.5 text-xs text-gray-400">
                            <Clock size={9} />
                            <span>{formatDate(item.lastUpdated)}</span>
                          </div>
                        </div>

                        {/* Actions - Compact */}
                        {editingVersionId === item.id ? (
                          <div className="flex items-center gap-0.5 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameVersion(item.id, editingName);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditing();
                              }}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.type === 'local' && (
                              <>
                                <button
                                  onClick={(e) => startEditing(item.id, item.name, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Rename"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={(e) => handleDuplicateVersion(item.id, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Duplicate"
                                >
                                  <Copy size={12} />
                                </button>
                                {Object.keys(versions).length > 1 && (
                                  <button
                                    onClick={(e) => handleDeleteVersion(item.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </>
                            )}
                            {item.type === 'firestore' && (
                              <button
                                onClick={(e) => handleDeleteFirestoreResume(item.id, item.displayName, e)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer - Compact */}
              <div className="p-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                {allItems.length} resume{allItems.length !== 1 ? 's' : ''} • 
                <HardDrive size={9} className="inline mx-1" />Local &
                <Cloud size={9} className="inline mx-1" />Saved
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/20 md:bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}