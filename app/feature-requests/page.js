// app/feature-requests/page.js
// Feature request voting page
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lightbulb, ThumbsUp, Plus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FeatureRequestVoting from '../components/FeatureRequestVoting';
import AuthProtection from '../components/AuthProtection';

function FeatureRequestsContent() {
  const { user } = useAuth();
  const [featureRequests, setFeatureRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingIds, setVotingIds] = useState(new Set());

  useEffect(() => {
    fetchFeatureRequests();
  }, []);

  const fetchFeatureRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/feature-request?limit=50');
      const data = await response.json();
      if (data.success) {
        setFeatureRequests(data.featureRequests);
      }
    } catch (error) {
      console.error('Error fetching feature requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (featureRequestId, hasVoted) => {
    if (!user) {
      return;
    }

    if (votingIds.has(featureRequestId)) return;

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
      }
    } catch (error) {
      console.error('Error voting:', error);
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
      return;
    }

    if (!user) {
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
        setNewRequest({ title: '', description: '' });
        setShowSubmitForm(false);
        fetchFeatureRequests();
      }
    } catch (error) {
      console.error('Error submitting feature request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feature Requests</h1>
              <p className="text-gray-600 mt-1">Vote for features you'd like to see</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Submit New Request */}
        {!showSubmitForm ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowSubmitForm(true)}
            className="w-full mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 text-gray-700 font-medium"
          >
            <Plus size={24} />
            Suggest a New Feature
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200"
          >
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feature Title
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., Add dark mode"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe the feature and how it would help..."
                  rows={4}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {featureRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No feature requests yet. Be the first to suggest one!</p>
              </div>
            ) : (
              featureRequests.map((request, index) => {
                const hasVoted = user && (request.voters || []).includes(user.uid);
                const isVoting = votingIds.has(request.id);

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                          {request.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">{request.description}</p>
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
                        className={`flex flex-col items-center gap-1 p-4 rounded-lg transition-all ${
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
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeatureRequestsPage() {
  return (
    <AuthProtection>
      <FeatureRequestsContent />
    </AuthProtection>
  );
}
