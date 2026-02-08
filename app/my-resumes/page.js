"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Edit, Trash2, Plus, Search, FileText, Clock,
  X, LayoutGrid, List
} from "lucide-react";
import { allTemplates as templates } from "../lib/allTemplates";
import AuthProtection from "../components/AuthProtection";
import MyResumesSkeleton from "../components/skeletons/MyResumesSkeleton";

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        const converted = value.toDate();
        return isNaN(converted.getTime()) ? null : converted;
      } catch { return null; }
    }
    if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  }
  return null;
};

const formatDateTime = (date) => {
  if (!date) return "Not updated yet";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const formatRelativeTime = (date) => {
  if (!date) return "Never";
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDateTime(date);
};

const getResumeDisplayName = (resume) => {
  const templateConfig = templates[resume.template];
  if (resume.resumeName?.trim()) return resume.resumeName.trim();
  if (resume.title?.trim()) return resume.title.trim();
  const personName =
    resume.name?.trim() ||
    resume.resumeData?.personal?.name?.trim() ||
    resume.resumeData?.personalInfo?.name?.trim() ||
    resume.resumeData?.basicInfo?.name?.trim();
  if (personName) return personName;
  if (templateConfig?.name) return templateConfig.name;
  return `Resume ${resume.id?.substring(0, 8) || ""}`.trim();
};

const getTemplateCategory = (resume) => {
  const templateConfig = templates[resume.template];
  return templateConfig?.category || "General";
};

const getTemplateName = (resume) => {
  const templateConfig = templates[resume.template];
  return templateConfig?.name || resume.template?.replace(/[-_]/g, " ") || "Unknown";
};

const getAvatarLetter = (text) => {
  if (!text) return "?";
  const trimmed = text.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
};

const getAvatarColor = (letter) => {
  const colors = [
    "from-[#0B1F3B] to-[#132D54]",
    "from-[#00C4B3] to-[#00A89A]",
    "from-[#0B1F3B] to-[#00C4B3]",
    "from-[#132D54] to-[#1a3a6b]",
    "from-[#00A89A] to-[#008F80]",
    "from-[#0B1F3B] to-[#0d2847]",
  ];
  const index = (letter?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
};

export default function MyResumes() {
  return (
    <AuthProtection>
      <MyResumesContent />
    </AuthProtection>
  );
}

function MyResumesContent() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("updated_desc");
  const [viewMode, setViewMode] = useState("grid");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        try {
          const resumesRef = collection(db, "users", currentUser.uid, "resumes");
          const snapshot = await getDocs(resumesRef);
          const resumeList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setResumes(resumeList);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load your data");
        }
      } else {
        setResumes([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resumeCount = resumes.length;

  const handleEdit = (resumeId, template) => {
    if (!user) { toast.error("Please log in to edit your resume!"); return; }
    const resume = resumes.find(r => r.id === resumeId);
    if (resume?.source === 'job_description_builder') { router.push(`/job-description-resume-builder?resumeId=${resumeId}`); return; }
    if (resume && (resume.isOnePager || resume.resumeType === 'one-pager')) { router.push(`/one-pager-builder/editor?resumeId=${resumeId}`); return; }
    const effectiveTemplate = template || "classic";
    const templateConfig = templates[effectiveTemplate];
    if (!templateConfig) {
      console.error("Template not found:", effectiveTemplate);
      toast.error("Template not found. Using default template.");
      router.push(`/resume-builder?resumeId=${resumeId}&template=classic`);
      return;
    }
    const url = templateConfig.category === "Job-Specific"
      ? `/job-specific-resume-builder?resumeId=${resumeId}&template=${effectiveTemplate}`
      : `/resume-builder?resumeId=${resumeId}&template=${effectiveTemplate}`;
    router.push(url);
  };

  const handleDelete = async (resumeId) => {
    if (!user) { toast.error("Please log in to delete your resume!"); return; }
    try {
      const resumeRef = doc(db, "users", user.uid, "resumes", resumeId);
      await deleteDoc(resumeRef);
      setResumes((prev) => prev.filter((resume) => resume.id !== resumeId));
      setShowDeleteModal(null);
      toast.success("Resume deleted successfully!");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    }
  };

  const handleCreateNewResume = () => {
    localStorage.setItem('startFreshResume', 'true');
    router.push("/resume-builder");
  };

  const processedResumes = useMemo(() => {
    return resumes.map((resume) => {
      const createdAtDate = parseDateValue(resume.createdAt);
      const updatedAtDate = parseDateValue(resume.updatedAt) || createdAtDate;
      return {
        ...resume,
        displayName: getResumeDisplayName(resume),
        templateCategory: getTemplateCategory(resume),
        templateName: getTemplateName(resume),
        updatedAtDate,
        createdAtDate,
      };
    });
  }, [resumes]);

  const filteredResumes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? processedResumes.filter((resume) => {
          const searchPool = [resume.displayName, resume.templateCategory, resume.resumeName, resume.resumeType, resume.template]
            .filter(Boolean).join(" ").toLowerCase();
          return searchPool.includes(normalizedSearch);
        })
      : processedResumes;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "updated_asc": return (a.updatedAtDate?.getTime() || 0) - (b.updatedAtDate?.getTime() || 0);
        case "name_asc": return a.displayName.localeCompare(b.displayName);
        case "name_desc": return b.displayName.localeCompare(a.displayName);
        case "updated_desc":
        default: return (b.updatedAtDate?.getTime() || 0) - (a.updatedAtDate?.getTime() || 0);
      }
    });
    return sorted;
  }, [processedResumes, searchTerm, sortOption]);

  if (loading) return <MyResumesSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-slate-100/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-sm w-full text-center"
        >
          <div className="w-14 h-14 mx-auto mb-5 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100">
            <Lock className="w-6 h-6 text-[#0B1F3B]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-sm text-gray-600 mb-6">
            Sign in to view and manage your resumes.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-[#0B1F3B] text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-[#071429] transition-all duration-200"
          >
            Sign In to Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-slate-100/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

        {/* Page Header - matches dashboard card pattern */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  My Resumes
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {resumeCount} resume{resumeCount !== 1 ? "s" : ""} in your collection
                </p>
              </div>
              <button
                onClick={handleCreateNewResume}
                className="inline-flex items-center justify-center gap-2 bg-[#00C4B3] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#00A89A] transition-all duration-200 w-full sm:w-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Resume
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {resumeCount === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mb-5 border border-gray-100">
                <FileText className="w-7 h-7 text-[#0B1F3B]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-sm text-gray-600 mb-8 text-center max-w-sm">
                Create your first resume and start applying to jobs with confidence.
              </p>
              <button
                onClick={handleCreateNewResume}
                className="inline-flex items-center gap-2 bg-[#00C4B3] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#00A89A] transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Resume
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search resumes..."
                    className="w-full h-10 pl-10 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4B3]/20 focus:border-[#00C4B3]/40 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort + View Toggle */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="h-10 pl-3 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00C4B3]/20 focus:border-[#00C4B3]/40 cursor-pointer"
                  >
                    <option value="updated_desc">Latest updated</option>
                    <option value="updated_asc">Oldest updated</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                  </select>

                  <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center justify-center w-10 h-10 transition-all duration-150 ${
                        viewMode === "grid"
                          ? "bg-[#00C4B3] text-white"
                          : "bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center justify-center w-10 h-10 transition-all duration-150 ${
                        viewMode === "list"
                          ? "bg-[#00C4B3] text-white"
                          : "bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* No results */}
            {filteredResumes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">No resumes match &ldquo;{searchTerm}&rdquo;</p>
                <p className="text-xs text-gray-500 mb-4">Try a different keyword or clear the search.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredResumes.map((resume, index) => {
                      const avatarLetter = getAvatarLetter(resume.displayName);
                      const avatarColor = getAvatarColor(avatarLetter);

                      return (
                        <motion.article
                          key={resume.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.3 }}
                          className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                          onClick={() => handleEdit(resume.id, resume.template)}
                        >
                          {/* Card Header */}
                          <div className="relative p-4 sm:p-5 pb-0">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} text-sm font-semibold text-white shadow-sm`}>
                                {avatarLetter}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate leading-tight">
                                  {resume.displayName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {resume.templateName}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Meta */}
                          <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatRelativeTime(resume.updatedAtDate)}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-md text-[11px] font-medium text-gray-600 border border-gray-100">
                                {resume.templateCategory}
                              </span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="px-4 sm:px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(resume.id, resume.template)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00C4B3] text-white rounded-lg text-xs font-semibold hover:bg-[#00A89A] transition-colors shadow-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(resume)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${resume.displayName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}

                    {/* Create New Card */}
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: filteredResumes.length * 0.04, duration: 0.3 }}
                      onClick={handleCreateNewResume}
                      className="group bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#00C4B3]/40 hover:shadow-sm transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px] cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-[#00C4B3]/10 flex items-center justify-center mb-3 transition-colors border border-gray-100 group-hover:border-[#00C4B3]/30">
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#00C4B3] transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 group-hover:text-[#0B1F3B] transition-colors">
                        Create New Resume
                      </span>
                    </motion.button>
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {filteredResumes.map((resume, index) => {
                      const avatarLetter = getAvatarLetter(resume.displayName);
                      const avatarColor = getAvatarColor(avatarLetter);

                      return (
                        <motion.article
                          key={resume.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/70 transition-colors cursor-pointer"
                          onClick={() => handleEdit(resume.id, resume.template)}
                        >
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} text-sm font-semibold text-white shadow-sm`}>
                            {avatarLetter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {resume.displayName}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-gray-500 truncate">{resume.templateName}</span>
                              <span className="text-gray-300">·</span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(resume.updatedAtDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(resume.id, resume.template)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00C4B3] text-white rounded-lg text-xs font-semibold hover:bg-[#00A89A] transition-colors shadow-sm"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(resume)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${resume.displayName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Delete Resume?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  &ldquo;{showDeleteModal.resumeName || showDeleteModal.displayName || 'This resume'}&rdquo; will be permanently deleted. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal.id)}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-white text-gray-900 border border-gray-200 shadow-lg',
        }}
      />
    </div>
  );
}
