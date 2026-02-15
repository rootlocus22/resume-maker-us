"use client";
import { useState, useEffect } from 'react';
import { Clock, Sparkles, Edit3, RotateCcw, X } from 'lucide-react';
import { getFieldVersionHistory } from '../lib/versionHistory';

const VersionHistoryViewer = ({ 
  userId, 
  resumeId, 
  fieldPath, 
  fieldName,
  isOpen, 
  onClose,
  onRestore 
}) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (isOpen && userId && fieldPath) {
      loadVersionHistory();
    }
  }, [isOpen, userId, fieldPath]);

  const loadVersionHistory = async () => {
    setIsLoading(true);
    try {
      const history = await getFieldVersionHistory(userId, resumeId, fieldPath);
      setVersions(history);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ai_rephrase':
        return <Sparkles size={14} className="text-purple-500" />;
      case 'ai_bullets':
        return <Sparkles size={14} className="text-accent" />;
      case 'manual_edit':
        return <Edit3 size={14} className="text-gray-500" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'ai_rephrase':
        return 'AI Rephrase';
      case 'ai_bullets':
        return 'AI Bullets';
      case 'manual_edit':
        return 'Manual Edit';
      default:
        return 'Edit';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const handleRestore = (version) => {
    if (onRestore) {
      onRestore(version.value);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-accent" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-500">{fieldName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No version history available</p>
              <p className="text-sm text-gray-400 mt-1">Versions will appear here as you make changes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`
                    border rounded-lg p-4 transition-all cursor-pointer
                    ${selectedVersion?.id === version.id 
                      ? 'border-accent/30 bg-accent-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(version.action)}
                      <span className="text-sm font-medium text-gray-700">
                        {getActionLabel(version.action)}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(version.timestamp)}
                      </span>
                      {index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version);
                          }}
                          className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded hover:bg-accent-100 transition-colors flex items-center gap-1"
                          title="Restore this version"
                        >
                          <RotateCcw size={12} />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 max-h-32 overflow-y-auto">
                    {version.value || '(empty)'}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {version.value.length} characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryViewer;

