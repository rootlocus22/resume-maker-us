"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Edit, Trash2, Plus, Search, ArrowUpDown,
  FileText, Clock, Sparkles, X, LayoutGrid, List,
  ChevronRight, MoreVertical, Download, Copy, Eye
} from "lucide-react";
import { allTemplates as templates } from "../lib/allTemplates";
import AuthProtection from "../components/AuthProtection";
import MyResumesSkeleton from "../components/skeletons/MyResumesSkeleton";

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        const converted = value.toDate();
        return isNaN(converted.getTime()) ? null : converted;
      } catch {
        return null;
      }
    }

    if (typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
    }
  }

  return null;
};

const formatDateTime = (date) => {
  if (!date) return "Not updated yet";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

  if (resume.resumeName && resume.resumeName.trim()) {
    return resume.resumeName.trim();
  }

  if (resume.title && resume.title.trim()) {
    return resume.title.trim();
  }

  const personName =
    resume.name?.trim() ||
    resume.resumeData?.personal?.name?.trim() ||
    resume.resumeData?.personalInfo?.name?.trim() ||
    resume.resumeData?.basicInfo?.name?.trim();

  if (personName) {
    return personName;
  }

  if (templateConfig?.name) {
    return templateConfig.name;
  }

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

// Color palette for avatar backgrounds based on first letter
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
          const resumeList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            };
          });
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
    if (!user) {
      toast.error("Please log in to edit your resume!");
      return;
    }

    const resume = resumes.find(r => r.id === resumeId);

    if (resume && resume.source === 'job_description_builder') {
      router.push(`/job-description-resume-builder?resumeId=${resumeId}`);
      return;
    }

    if (resume && (resume.isOnePager || resume.resumeType === 'one-pager')) {
      router.push(`/one-pager-builder/editor?resumeId=${resumeId}`);
      return;
    }

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
    if (!user) {
      toast.error("Please log in to delete your resume!");
      return;
    }

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
        const searchPool = [
          resume.displayName,
          resume.templateCategory,
          resume.resumeName,
          resume.resumeType,
          resume.template,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchPool.includes(normalizedSearch);
      })
      : processedResumes;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "updated_asc":
          return (a.updatedAtDate?.getTime() || 0) - (b.updatedAtDate?.getTime() || 0);
        case "name_asc":
          return a.displayName.localeCompare(b.displayName);
        case "name_desc":
          return b.displayName.localeCompare(a.displayName);
        case "updated_desc":
        default:
          return (b.updatedAtDate?.getTime() || 0) - (a.updatedAtDate?.getTime() || 0);
      }
    });

    return sorted;
  }, [processedResumes, searchTerm, sortOption]);

  if (loading) {
    return <MyResumesSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#0B1F3B] to-[#132D54] rounded-2xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#00C4B3]" />
          </div>

          <h2 className="text-xl font-bold mb-3 text-[#0B1F3B]">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            Sign in to access your saved resumes and continue building your career.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-[#0B1F3B] text-white px-6 py-3 rounded-xl hover:bg-[#132D54] transition-all duration-200 font-semibold shadow-lg"
          >
            Sign In to Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F3B]">My Resumes</h1>
              <p className="text-gray-500 text-sm mt-1">
                {resumeCount} resume{resumeCount !== 1 ? "s" : ""} in your collection
              </p>
            </div>

            <button
              onClick={handleCreateNewResume}
              className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#132D54] transition-all shadow-sm"
            >
              <Plus size={16} />
              New Resume
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {resumeCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0B1F3B] to-[#132D54] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-[#00C4B3]" />
            </div>

            <h3 className="text-xl font-bold text-[#0B1F3B] mb-2">No resumes yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm text-center text-sm leading-relaxed">
              Create your first resume and start applying to jobs with confidence. Our AI-powered builder makes it easy.
            </p>

            <button
              onClick={handleCreateNewResume}
              className="bg-[#0B1F3B] text-white px-8 py-3.5 rounded-xl hover:bg-[#132D54] transition-all font-semibold shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Resume
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resumes..."
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] cursor-pointer"
                  >
                    <option value="updated_desc">Latest updated</option>
                    <option value="updated_asc">Oldest updated</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                  </select>
                  <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-[#0B1F3B] text-white" : "text-gray-400 hover:text-gray-600"}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-[#0B1F3B] text-white" : "text-gray-400 hover:text-gray-600"}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* No results */}
            {filteredResumes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <Search size={24} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-600 text-sm">No resumes match &ldquo;{searchTerm}&rdquo;</p>
                <p className="mt-1 text-xs text-gray-400">Try a different keyword or clear the search.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#0B1F3B]/20 px-3 py-1.5 text-xs font-medium text-[#0B1F3B] hover:bg-[#0B1F3B]/5 transition-colors"
                >
                  <X size={12} />
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResumes.map((resume, index) => {
                      const avatarLetter = getAvatarLetter(resume.displayName);
                      const avatarColor = getAvatarColor(avatarLetter);

                      return (
                        <motion.article
                          key={resume.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#00C4B3]/30 transition-all duration-200 overflow-hidden"
                        >
                          {/* Card Top - Template Preview Area */}
                          <div
                            className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-gray-100 flex items-center justify-center cursor-pointer"
                            onClick={() => handleEdit(resume.id, resume.template)}
                          >
                            {/* Mock resume lines */}
                            <div className="w-20 space-y-1.5 opacity-30">
                              <div className="h-2.5 bg-[#0B1F3B] rounded-sm w-full"></div>
                              <div className="h-1.5 bg-gray-400 rounded-sm w-3/4"></div>
                              <div className="h-1 bg-gray-300 rounded-sm w-full"></div>
                              <div className="h-1 bg-gray-300 rounded-sm w-5/6"></div>
                              <div className="h-1 bg-gray-300 rounded-sm w-full"></div>
                              <div className="h-1 bg-gray-300 rounded-sm w-2/3"></div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-[#0B1F3B]/0 group-hover:bg-[#0B1F3B]/60 transition-all duration-200 flex items-center justify-center">
                              <span className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
                                <Edit size={14} />
                                Open Editor
                              </span>
                            </div>

                            {/* Category Badge */}
                            <span className="absolute top-2.5 left-2.5 inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-[#0B1F3B] shadow-sm border border-gray-100">
                              {resume.templateCategory}
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${avatarColor} text-xs font-bold text-white`}>
                                {avatarLetter}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {resume.displayName}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize truncate">
                                  {resume.templateName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                <Clock size={11} />
                                {formatRelativeTime(resume.updatedAtDate)}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(resume.id, resume.template)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#132D54] transition-colors"
                                >
                                  <Edit size={12} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => setShowDeleteModal(resume)}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  aria-label={`Delete ${resume.displayName}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}

                    {/* Create New Card */}
                    <motion.button
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: filteredResumes.length * 0.04 }}
                      onClick={handleCreateNewResume}
                      className="group bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-[#00C4B3] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center min-h-[240px] cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#0B1F3B]/5 group-hover:bg-[#00C4B3]/10 flex items-center justify-center mb-3 transition-colors">
                        <Plus size={22} className="text-[#0B1F3B]/40 group-hover:text-[#00C4B3] transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-400 group-hover:text-[#0B1F3B] transition-colors">
                        Create New Resume
                      </span>
                    </motion.button>
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {filteredResumes.map((resume, index) => {
                      const avatarLetter = getAvatarLetter(resume.displayName);
                      const avatarColor = getAvatarColor(avatarLetter);

                      return (
                        <motion.article
                          key={resume.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => handleEdit(resume.id, resume.template)}
                        >
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${avatarColor} text-xs font-bold text-white`}>
                            {avatarLetter}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {resume.displayName}
                              </h3>
                              <span className="hidden sm:inline-flex items-center rounded-md bg-[#0B1F3B]/5 px-1.5 py-0.5 text-[10px] font-medium text-[#0B1F3B]">
                                {resume.templateCategory}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400 capitalize truncate">
                                {resume.templateName}
                              </span>
                              <span className="text-gray-200">·</span>
                              <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                                <Clock size={11} />
                                {formatRelativeTime(resume.updatedAtDate)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(resume.id, resume.template)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#132D54] transition-colors"
                            >
                              <Edit size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(resume)}
                              className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${resume.displayName}`}
                            >
                              <Trash2 size={15} />
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
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100"
            >
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 bg-red-50 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-900">Delete Resume?</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  This will permanently delete <strong className="text-gray-700">&ldquo;{showDeleteModal.resumeName || showDeleteModal.displayName || 'this resume'}&rdquo;</strong>. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal.id)}
                    className="flex-1 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium text-sm shadow-sm"
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
          duration: 4000,
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }}
      />
    </div>
  );
}
