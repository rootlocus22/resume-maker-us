// app/components/FeedbackWidget.js
// In-app feedback widget that appears on key pages
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Star, Send, ThumbsUp, ThumbsDown, Lightbulb, AlertCircle, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function FeedbackWidget({ 
  context = 'general', // 'general', 'resume-builder', 'download', 'ats-checker'
  position = 'bottom-right' // 'bottom-right', 'bottom-left'
}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('general'); // 'general', 'bug', 'feature', 'improvement'
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if user has already submitted feedback in this session
  useEffect(() => {
    const feedbackKey = `feedback_submitted_${context}`;
    const submitted = sessionStorage.getItem(feedbackKey);
    if (submitted === 'true') {
      setHasSubmitted(true);
    }
  }, [context]);

  // Check if widget is hidden
  useEffect(() => {
    const hiddenKey = `feedback_widget_hidden_${context}`;
    const hidden = localStorage.getItem(hiddenKey);
    if (hidden === 'true') {
      setIsHidden(true);
    }
  }, [context]);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle hide widget
  const handleHideWidget = () => {
    const hiddenKey = `feedback_widget_hidden_${context}`;
    localStorage.setItem(hiddenKey, 'true');
    setIsHidden(true);
    setIsOpen(false);
    toast.success('Feedback widget hidden. You can enable it from settings if needed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 && !comment.trim()) {
      toast.error('Please provide a rating or comment');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get additional user data for better action-taking
      const userData = {
        userId: user?.uid || 'anonymous',
        name: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        email: user?.email || null,
        rating: rating || null,
        comment: comment.trim() || 'No comment provided',
        feedbackType: feedbackType,
        context: context,
        source: 'in_app_widget',
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

      // Mark as submitted in session storage
      const feedbackKey = `feedback_submitted_${context}`;
      sessionStorage.setItem(feedbackKey, 'true');
      
      setHasSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsMinimized(true);
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate position based on mobile and context
  const getPositionClasses = () => {
    const basePosition = position === 'bottom-right' ? 'right-4' : 'left-4';
    
    // On mobile, position above bottom navigation bar (which is ~60px tall)
    // For resume-builder context, position higher to avoid bottom bar
    if (isMobile && context === 'resume-builder') {
      return `${basePosition} bottom-20`; // Above mobile bottom nav (~60px) + some padding
    } else if (isMobile) {
      return `${basePosition} bottom-16`; // Above mobile bottom nav
    } else {
      return `${basePosition} bottom-4`; // Desktop position
    }
  };

  if (hasSubmitted && !isOpen) {
    return null; // Don't show widget if already submitted
  }

  if (isHidden) {
    return null; // Don't show if user has hidden it
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Minimized Button */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="minimized-button"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            aria-label="Open feedback"
          >
            <MessageSquare size={20} className="md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feedback Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="feedback-form"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-80 md:w-96 p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Share Your Feedback</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Don't set minimized - let AnimatePresence handle the transition
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Minimize"
                  aria-label="Minimize feedback"
                >
                  <Minus size={20} />
                </button>
                <button
                  onClick={handleHideWidget}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Hide feedback widget permanently"
                  aria-label="Hide feedback widget permanently"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {hasSubmitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700 font-medium">Thank you for your feedback!</p>
                <p className="text-sm text-gray-500 mt-2">We appreciate your input.</p>
                <Link
                  href="/feature-requests"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Lightbulb size={16} />
                  Suggest a Feature
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's this about?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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
                          className={`p-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-1 ${
                            feedbackType === type.value
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={16} />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your experience?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg transition-all ${
                          rating >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <Star
                          size={24}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (rating === 0 && !comment.trim())}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </button>

                {/* Feature Request Link */}
                <div className="pt-3 border-t border-gray-200">
                  <Link
                    href="/feature-requests"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors text-sm font-medium text-gray-700"
                  >
                    <Lightbulb size={16} className="text-yellow-600" />
                    <span>Suggest a Feature</span>
                  </Link>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
