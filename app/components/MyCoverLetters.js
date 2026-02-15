"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Edit, Trash2 } from "lucide-react";
import { coverLetterTemplates } from "../lib/coverLetterTemplate";

export default function MyCoverLetters() {
  const [user, setUser] = useState(null);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        try {
          const coverLettersRef = collection(db, "users", currentUser.uid, "coverLetters");
          const snapshot = await getDocs(coverLettersRef);
          const coverLetterList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCoverLetters(coverLetterList);
        } catch (error) {
          console.error("Error fetching cover letters:", error);
          toast.error("Failed to load cover letters");
        }
      } else {
        setCoverLetters([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (coverLetterId, template) => {
    if (!user) {
      toast.error("Please log in to edit your cover letter!");
      return;
    }

    const templateConfig = coverLetterTemplates[template];
    if (!templateConfig) {
      toast.error("Template not found. It may have been removed or is invalid.");
      return;
    }

    router.push(`/cover-letter/edit/${coverLetterId}?template=${template}`);
  };

  const handleDelete = async (coverLetterId) => {
    if (!user) {
      toast.error("Please log in to delete your cover letter!");
      return;
    }

    if (!confirm("Are you sure you want to delete this cover letter? This action cannot be undone.")) {
      return;
    }

    try {
      const coverLetterRef = doc(db, "users", user.uid, "coverLetters", coverLetterId);
      await deleteDoc(coverLetterRef);
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== coverLetterId));
      toast.success("Cover letter deleted successfully!");
    } catch (error) {
      console.error("Error deleting cover letter:", error);
      toast.error("Failed to delete cover letter");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
          <Lock size={36} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">Please Log In</h2>
          <p className="text-gray-600 text-sm md:text-base mb-4">You need to log in to view your saved cover letters.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all w-full md:w-auto"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">My Cover Letters</h1>
          <button
            onClick={() => router.push("/cover-letter-builder")}
            className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all w-full sm:w-auto"
          >
            Create New
          </button>
        </div>

        {/* Cover Letters List */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          {coverLetters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-base sm:text-lg mb-2">No cover letters saved yet</p>
              <p className="text-gray-500 text-sm sm:text-base">Start building your first cover letter today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coverLetters.map((coverLetter) => {
                const templateConfig = coverLetterTemplates[coverLetter.template];
                const displayName =
                  coverLetter.coverLetterName ||
                  `${coverLetter.coverLetterData?.jobTitle || ""} - ${coverLetter.coverLetterData?.company || "Unknown"} (${new Date(coverLetter.updatedAt || coverLetter.createdAt).toLocaleDateString()})` ||
                  ` Cover Letter (${new Date(coverLetter.updatedAt || coverLetter.createdAt).toLocaleDateString()})`;
                const category = templateConfig?.category || "Unknown";

                return (
                  <div
                    key={coverLetter.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="space-y-1 w-full sm:w-auto">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{displayName}</h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded-md mr-2">{category}</span>
                        <span className="block sm:inline">Last updated: {new Date(coverLetter.updatedAt || coverLetter.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleEdit(coverLetter.id, coverLetter.template)}
                        className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white px-3 py-2 rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all w-full sm:w-auto justify-center text-sm"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coverLetter.id)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all w-full sm:w-auto justify-center text-sm"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}