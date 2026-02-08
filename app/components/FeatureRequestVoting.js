// app/components/FeatureRequestVoting.js
// Feature request voting system
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ThumbsUp, Plus, X, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function FeatureRequestVoting({ isOpen, onClose }) {
  const { user } = useAuth();
  const [featureRequests, setFeatureRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingIds, setVotingIds] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchFeatureRequests();
    }
  }, [isOpen]);

  const fetchFeatureRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/feature-request?limit=20');
      const data = await response.json();
      if (data.success) {
        setFeatureRequests(data.featureRequests);
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (featureRequestId, hasVoted) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    if (votingIds.has(featureRequestId)) return; // Prevent double voting

    setVotingIds((prev) => new Set([...prev, featureRequestId]));

    try {
      const response = await fetch('/api/feedback/feature-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureRequestId,
          userId: user.uid,
          action: hasVoted ? 'unvote' : 'vote',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setFeatureRequests((prev) =>
          prev.map((req) => {
            if (req.id === featureRequestId) {
              const voters = req.voters || [];
              const hasVotedBefore = voters.includes(user.uid);
              return {
                ...req,
                votes: hasVotedBefore ? req.votes - 1 : req.votes + 1,
                voters: hasVotedBefore
                  ? voters.filter((id) => id !== user.uid)
                  : [...voters, user.uid],
              };
            }
            return req;
          })
        );
        toast.success(hasVoted ? 'Vote removed' : 'Vote added!');
      } else {
        toast.error(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setVotingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(featureRequestId);
        return newSet;
      });
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    if (!user) {
      toast.error('Please sign in to submit a feature request');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback/feature-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRequest.title.trim(),
          description: newRequest.description.trim(),
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.existing) {
          toast.info('Similar feature request already exists');
        } else {
          toast.success('Feature request submitted!');
          setNewRequest({ title: '', description: '' });
          setShowSubmitForm(false);
          fetchFeatureRequests();
        }
      } else {
        toast.error(data.error || 'Failed to submit feature request');
      }
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast.error('Failed to submit feature request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Feature Requests</h2>
                <p className="text-sm text-gray-600">Vote for features you'd like to see</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Submit New Request Button */}
                {!showSubmitForm && (
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-700 font-medium"
                  >
                    <Plus size={20} />
                    Suggest a New Feature
                  </button>
                )}

                {/* Submit Form */}
                {showSubmitForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feature Title
                        </label>
                        <input
                          type="text"
                          value={newRequest.title}
                          onChange={(e) =>
                            setNewRequest({ ...newRequest, title: e.target.value })
                          }
                          placeholder="e.g., Add dark mode"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newRequest.description}
                          onChange={(e) =>
                            setNewRequest({ ...newRequest, description: e.target.value })
                          }
                          placeholder="Describe the feature and how it would help..."
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSubmitForm(false);
                            setNewRequest({ title: '', description: '' });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Feature Requests List */}
                <div className="space-y-3">
                  {featureRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No feature requests yet. Be the first to suggest one!</p>
                    </div>
                  ) : (
                    featureRequests.map((request) => {
                      const hasVoted = user && (request.voters || []).includes(user.uid);
                      const isVoting = votingIds.has(request.id);

                      return (
                        <div
                          key={request.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {request.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>By {request.userName}</span>
                                <span>
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded ${
                                    request.status === 'implemented'
                                      ? 'bg-green-100 text-green-700'
                                      : request.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {request.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleVote(request.id, hasVoted)}
                              disabled={isVoting || !user}
                              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                                hasVoted
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isVoting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <ThumbsUp className="w-5 h-5" />
                              )}
                              <span className="text-sm font-semibold">{request.votes || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
