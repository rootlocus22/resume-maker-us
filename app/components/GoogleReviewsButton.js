"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';

const GoogleReviewsButton = ({ 
  variant = "default", // "default", "success", "testimonial", "upgrade"
  size = "medium", // "small", "medium", "large"
  showText = true,
  className = "",
  onClick = null
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const googleReviewsUrl = "https://www.google.com/search?sca_esv=b86c91fa3b6f4170&sxsrf=AE3TifPRLtJDqL7htl0SenZk1iF4fN_QhQ:1757186068465&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-EyuK-rVchB7bNyuFSky99VIlTHwKPQ6uyKj-l2eXBvvt_2RPuK0ZKgpBkeHf4GvIkJ6Hp590pQZMMtlfBNnwajafjd_9&q=ExpertResume+Reviews&sa=X&ved=2ahUKEwiI4aib7MSPAxXnzTQHHe2tDUEQ0bkNegQIUBAE&biw=1728&bih=992&dpr=2#lrd=0x3bae136ed29b6951:0x1613f7ea596d7546,3,,,,";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Open Google Reviews in new tab
    window.open(googleReviewsUrl, '_blank', 'noopener,noreferrer');
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl";
      case "testimonial":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-xl hover:shadow-2xl border-2 border-yellow-300/50";
      case "upgrade":
        return "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl";
      default:
        return "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return "px-3 py-2 text-sm";
      case "large":
        return "px-6 py-4 text-lg";
      default:
        return "px-4 py-3 text-base";
    }
  };

  const getText = () => {
    switch (variant) {
      case "success":
        return "Rate Your Experience";
      case "testimonial":
        return "Leave a Google Review";
      case "upgrade":
        return "Share Your Success";
      default:
        return "Rate Us on Google";
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
        rounded-xl font-bold transition-all duration-300 
        flex items-center gap-2 justify-center
        hover:shadow-2xl transform hover:scale-105
        relative overflow-hidden
      `}
    >
      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6 }}
      />
      
      <motion.div
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Star size={size === "small" ? 16 : size === "large" ? 24 : 20} className="fill-current" />
      </motion.div>
      
      {showText && (
        <span className="whitespace-nowrap relative z-10">
          {getText()}
        </span>
      )}
      
      <ExternalLink 
        size={size === "small" ? 14 : size === "large" ? 20 : 16} 
        className="opacity-80 relative z-10" 
      />
    </motion.button>
  );
};

export default GoogleReviewsButton;
