"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  FileText, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  getUploadHistory, 
  deleteHistoryItem, 
  clearUploadHistory,
  formatHistoryTimestamp,
  estimateDataSize
} from '../lib/uploadHistory';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function UploadHistoryPanel({ 
  userId, 
  onRestore, 
  isOpen, 
  onClose 
}) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadHistory();
    }
  }, [isOpen, userId]);

  const loadHistory = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const historyData = await getUploadHistory(userId);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (item) => {
    try {
      onRestore(item);
      onClose();
    } catch (error) {
      console.error('Error restoring upload:', error);
      toast.error('Failed to restore upload');
    }
  };

  const handleDeleteClick = (e, historyId) => {
    e.stopPropagation();
    setItemToDelete(historyId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteHistoryItem(userId, itemToDelete);
      if (success) {
        await loadHistory();
        toast.success('History item deleted');
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        toast.error('Failed to delete history item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete history item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllClick = () => {
    setClearAllModalOpen(true);
  };

  const confirmClearAll = async () => {
    setIsDeleting(true);
    try {
      const success = await clearUploadHistory(userId);
      if (success) {
        setHistory([]);
        toast.success('All history cleared');
        setClearAllModalOpen(false);
      } else {
        toast.error('Failed to clear history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Clock size={24} className="text-white flex-shrink-0 sm:w-7 sm:h-7" />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Upload History</h2>
                  <p className="text-accent-100 text-xs sm:text-sm hidden sm:block">Quickly restore previous resume uploads</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Loader2 size={40} className="text-accent animate-spin mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                  <p className="text-sm sm:text-base text-gray-600">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                  <Clock size={48} className="text-gray-300 mb-3 sm:mb-4 sm:w-16 sm:h-16" />
                  <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No History Yet</p>
                  <p className="text-sm sm:text-base text-gray-500 text-center max-w-md">
                    Upload a resume to start building your history. Previous uploads will appear here for quick access.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-accent-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handleRestore(item)}
                    >
                      {/* Item Header */}
                      <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <FileText size={20} className="text-accent sm:w-6 sm:h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate mb-1">
                              {item.fileName}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                {formatHistoryTimestamp(item.timestamp)}
                              </span>
                              {item.atsScore && (
                                <span className="flex items-center gap-1 font-medium text-accent">
                                  <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                  Score: {item.atsScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => toggleExpand(e, item.id)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-accent hover:bg-accent-50 rounded-lg transition-colors"
                          >
                            {expandedId === item.id ? (
                              <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                            ) : (
                              <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, item.id)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200 bg-gray-50"
                          >
                            <div className="p-3 sm:p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                                  <span className="text-gray-500 block mb-1 text-xs sm:text-sm">Template</span>
                                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{item.template || 'Default'}</span>
                                </div>
                                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                                  <span className="text-gray-500 block mb-1 text-xs sm:text-sm">File Type</span>
                                  <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block">{item.fileType}</span>
                                </div>
                              </div>
                              {item.parsedData && (
                                <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                                  <span className="text-gray-500 block mb-2 text-xs sm:text-sm">Resume Data</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs">
                                    {item.parsedData.experience?.length > 0 && (
                                      <div>
                                        <span className="text-gray-600">Experience: </span>
                                        <span className="font-medium">{item.parsedData.experience.length} roles</span>
                                      </div>
                                    )}
                                    {item.parsedData.education?.length > 0 && (
                                      <div>
                                        <span className="text-gray-600">Education: </span>
                                        <span className="font-medium">{item.parsedData.education.length} items</span>
                                      </div>
                                    )}
                                    {item.parsedData.skills?.length > 0 && (
                                      <div>
                                        <span className="text-gray-600">Skills: </span>
                                        <span className="font-medium">{item.parsedData.skills.length} skills</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => handleRestore(item)}
                                className="w-full py-2 sm:py-2.5 px-4 bg-gradient-to-r from-primary to-accent text-white text-sm sm:text-base font-medium rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/30"
                              >
                                <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                                Restore This Upload
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  {history.length} {history.length === 1 ? 'item' : 'items'}
                </p>
                <button
                  onClick={handleClearAllClick}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear All History</span>
                  <span className="sm:hidden">Clear All</span>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete History Item"
        message="Are you sure you want to delete this upload from your history? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        onConfirm={confirmClearAll}
        title="Clear All History"
        message="Are you sure you want to clear all upload history? This will permanently delete all saved uploads and cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
}
