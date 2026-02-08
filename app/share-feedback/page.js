"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, ThumbsUp, ThumbsDown, Lightbulb, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ShareFeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('general');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 && !comment.trim()) {
      toast.error('Please provide a rating or comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        userId: user?.uid || 'anonymous',
        name: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        email: user?.email || null,
        rating: rating || null,
        comment: comment.trim() || 'No comment provided',
        feedbackType: feedbackType,
        context: 'share-feedback-page',
        source: 'share_feedback_page',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : null,
        pageUrl: typeof window !== 'undefined' ? window.location.href : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : null,
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null,
        language: typeof navigator !== 'undefined' ? navigator.language : null,
        platform: typeof navigator !== 'undefined' ? navigator.platform : null,
      };

      const response = await fetch('/api/feedback/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save feedback');
      }

      setHasSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error(`Failed to submit feedback: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563EB]/10 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-[#2563EB]" />
            </div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Share Your Feedback</h1>
            <p className="text-gray-600">Help us improve ExpertResume by sharing your thoughts</p>
          </div>

          {hasSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ThumbsUp className="w-10 h-10 text-[#0D9488]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">We appreciate your feedback and will use it to improve our service.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium"
                >
                  Back to Home
                </Link>
                <Link
                  href="/feature-requests"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-gray-700 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors font-medium"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Suggest a Feature
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's this about?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'general', label: 'General', icon: MessageSquare },
                    { value: 'bug', label: 'Bug', icon: AlertCircle },
                    { value: 'feature', label: 'Feature', icon: Lightbulb },
                    { value: 'improvement', label: 'Improvement', icon: ThumbsUp },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedbackType(type.value)}
                        className={`p-4 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                          feedbackType === type.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-3 rounded-lg transition-all ${
                        rating >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star
                        size={32}
                        className={rating >= star ? 'fill-current' : ''}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={6}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (rating === 0 && !comment.trim())}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Feedback
                  </>
                )}
              </button>

              {/* Feature Request Link */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/feature-requests"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors font-medium text-gray-700"
                >
                  <Lightbulb size={20} className="text-yellow-600" />
                  <span>Suggest a Feature</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
