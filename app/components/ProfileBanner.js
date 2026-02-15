"use client";
import { useState } from "react";
import { X, User, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import {useRouter} from 'next/navigation';

export default function ProfileBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter()

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary via-accent to-orange-400 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 sm:top-4 left-4 sm:left-10 animate-pulse">
          <Sparkles size={16} className="sm:w-5 sm:h-5" />
        </div>
        <div className="absolute top-6 sm:top-12 right-8 sm:right-16 animate-bounce delay-300">
          <Star size={14} className="sm:w-4 sm:h-4" />
        </div>
        <div className="absolute bottom-4 sm:bottom-6 left-8 sm:left-20 animate-pulse delay-500">
          <User size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 animate-bounce delay-700">
          <Sparkles size={12} className="sm:w-[14px] sm:h-[14px]" />
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-white">
                🎉 Create Your Profile
              </h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
          
          <p className="text-white/90 text-sm leading-relaxed pl-13">
            Showcase your skills and experience with a beautiful public profile!
          </p>
          
          <div className="pl-13">
            <Link
              href="/edit-profile"
              className="inline-flex items-center px-4 py-2 bg-white text-accent font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              Create Profile
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">
                🎉 New! Create Your Professional Profile
              </h3>
              <p className="text-white/90 text-sm">
                Showcase your skills, experience, and achievements with a beautiful public profile. 
                Share it with recruiters and network connections!
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Link
                href="/edit-profile"
                className="inline-flex items-center px-4 py-2 bg-white text-accent font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Profile
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Subtle animation border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-accent-400 to-accent-400 animate-pulse"></div>
    </div>
  );
}
