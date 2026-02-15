"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonial() {
  const [feedback, setFeedback] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // AI-generated fallback testimonials for empty feedback
  const fallbackTestimonials = [
    "ExpertResume helped me create a much more professional-looking resume. The process was smooth and easy.",
    "The ATS optimization feature is really helpful - my resume looks more polished and organized now.",
    "Finally have a resume I'm confident about. The templates are clean and professional.",
    "The platform made resume building straightforward. Happy with the final result.",
    "Great tool for organizing my experience and skills in a professional format.",
    "The AI suggestions helped me improve my resume content. Much better than my old version.",
    "Easy to use interface and the templates look very professional. Recommended.",
    "Good experience overall. The resume builder is intuitive and saves time.",
    "Professional templates and helpful formatting. My resume looks much better now.",
    "The real-time preview feature is very helpful. Makes the editing process much easier.",
    "Clean, professional results. The platform is user-friendly and efficient.",
    "The job-specific tips were useful. My resume feels more targeted and relevant now."
  ];

  const getAIGeneratedComment = (index) => {
    const fallbackIndex = index % fallbackTestimonials.length;
    return fallbackTestimonials[fallbackIndex];
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/feedback");
        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }
        const { feedback } = await response.json();
        setFeedback(feedback.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  useEffect(() => {
    if (feedback.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % feedback.length);
      }, 5000); // Rotate every 5 seconds
      return () => clearInterval(interval);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary to-accent py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return null; // Hide component if no testimonials
  }

  const getProfileInfo = (profile) => {
    if (profile?.jobTitle && profile?.company) {
      return `${profile.jobTitle} at ${profile.company}`;
    }
    return profile?.jobTitle || profile?.company || "";
  };

  const getDisplayComment = (comment, index) => {
    if (!comment || comment === "No comment provided" || comment.trim() === "") {
      return getAIGeneratedComment(index);
    }
    return comment;
  };

  return (
    <div className="bg-gradient-to-r from-primary to-accent py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">What Our Users Say</h2>
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < feedback[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">
                "{getDisplayComment(feedback[currentIndex].comment, currentIndex)}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img 
                      src={`/images/testimonial-${(currentIndex % 3) + 1}.jpg`}
                      alt={`${feedback[currentIndex].name || "User"} profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {(feedback[currentIndex].name || "U")[0].toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{feedback[currentIndex].name || "Anonymous"}</p>
                    <p className="text-gray-500 text-sm">
                      {getProfileInfo(feedback[currentIndex].profileInfo)}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {feedback[currentIndex].timestamp.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {feedback.length > 1 && (
            <div className="flex justify-center mt-4 ">
              {feedback.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}