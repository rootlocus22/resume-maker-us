// app/components/PostDownloadSurvey.js
// Survey shown after PDF download
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PostDownloadSurvey({ 
  isOpen, 
  onClose,
  downloadSuccess = true,
  resumeName = 'Resume'
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Quick rating, 2: Detailed feedback
  const [quickRating, setQuickRating] = useState(null); // 'good', 'bad'
  const [detailedRating, setDetailedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setQuickRating(null);
      setDetailedRating(0);
      setComment('');
      setHasSubmitted(false);
    }
  }, [isOpen]);

  const handleQuickRating = async (rating) => {
    setQuickRating(rating);
    
    // If bad rating, go to detailed feedback
    if (rating === 'bad') {
      setStep(2);
    } else {
      // If good rating, submit immediately
      await submitFeedback(rating === 'good' ? 5 : 3, '');
    }
  };

  const submitFeedback = async (rating, commentText) => {
    setIsSubmitting(true);
    try {
      // Get additional user data for better action-taking
      const userData = {
        userId: user?.uid || 'anonymous',
        name: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        email: user?.email || null,
        rating: rating,
        comment: commentText.trim() || (rating >= 4 ? 'Download successful' : 'Download issue reported'),
        feedbackType: 'download_survey',
        context: 'post_download',
        downloadSuccess: downloadSuccess,
        resumeName: resumeName,
        source: 'post_download_survey',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : null,
        // Additional data for action-taking
        pageUrl: typeof window !== 'undefined' ? window.location.href : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : null,
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null,
        language: typeof navigator !== 'undefined' ? navigator.language : null,
        platform: typeof navigator !== 'undefined' ? navigator.platform : null,
      };

      // Use API endpoint instead of direct Firestore write (bypasses security rules)
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
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error(`Failed to submit feedback: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    if (detailedRating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    await submitFeedback(detailedRating, comment);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          {hasSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700 font-medium">Thank you for your feedback!</p>
              <p className="text-sm text-gray-500 mt-2">We appreciate your input.</p>
            </div>
          ) : step === 1 ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                How was your download experience?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your feedback helps us improve
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleQuickRating('good')}
                  disabled={isSubmitting}
                  className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all disabled:opacity-50"
                >
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                  <span className="font-medium text-gray-700">Good</span>
                </button>
                <button
                  onClick={() => handleQuickRating('bad')}
                  disabled={isSubmitting}
                  className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  <ThumbsDown className="w-8 h-8 text-red-600" />
                  <span className="font-medium text-gray-700">Bad</span>
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            </div>
          ) : (
            <form onSubmit={handleDetailedSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tell us what went wrong
              </h3>
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate your experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDetailedRating(star)}
                      className={`p-2 rounded-lg transition-all ${
                        detailedRating >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star
                        size={24}
                        className={detailedRating >= star ? 'fill-current' : ''}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What happened? (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the issue you encountered..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || detailedRating === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
