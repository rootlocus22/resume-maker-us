import { useState } from "react";
import { Play, Star, Users, Clock, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";

export default function VideoComponent({ 
  src = "https://www.youtube.com/shorts/au0fmjnq6LY"
}) {
  const [isPlayButtonVisible, setIsPlayButtonVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract YouTube video ID from the URL
  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(src);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0&playsinline=1` : null;

  const handlePlay = () => {
    setIsPlayButtonVisible(false);
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    console.error("Video failed to load:", src);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 max-w-sm mx-auto">
      {/* Enhanced Stats Badge - Mobile Optimized */}
      <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span className="hidden sm:inline">100,000++ Success Stories</span>
          <span className="sm:hidden">52K+ Stories</span>
        </div>
      </div>

      {/* Rating Badge - Mobile Optimized */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-gray-200">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500 fill-current" />
          <span>4.9/5</span>
          <span className="text-gray-500 ml-1 hidden sm:inline">(2,847)</span>
        </div>
      </div>

      {/* Video container with responsive aspect ratio (9:16 for YouTube Shorts) */}
      <div className="relative pt-[177.78%] bg-gradient-to-br from-primary to-primary max-w-sm mx-auto">
        {!hasError && embedUrl && isPlaying ? (
          <iframe
            className="absolute inset-0 w-full h-full rounded-t-2xl"
            src={embedUrl}
            title="ExpertResume AI Demo -  Introduction"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={handleVideoError}
          />
        ) : !hasError && embedUrl ? (
          // Placeholder when video is not playing yet
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary"></div>
        ) : (
          // Error state - show attractive placeholder for vertical video
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary">
            <div className="text-center p-6">
              <div className="mb-4">
                <AlertCircle size={40} className="text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">
                  📱 Video Loading...
                </h3>
                <p className="text-accent-100 text-sm mb-4">
                  Having trouble loading our  introduction? 
                  Watch it directly on YouTube!
                </p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <div className="text-yellow-400 font-bold">60 Sec</div>
                    <div className="text-white/80">Build Time</div>
                  </div>
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <div className="text-accent-400 font-bold">98% ATS</div>
                    <div className="text-white/80">Success Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-sm"
                  >
                    <ExternalLink size={16} />
                    Watch on YouTube
                  </a>
                  <a
                    href="/resume-builder"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg text-sm"
                  >
                    <Play size={16} />
                    Try It Now - Free!
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Play button overlay - Optimized for Vertical Video */}
        {isPlayButtonVisible && !isPlaying && !hasError && embedUrl && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            {/* Main Play Button */}
            <button
              className="relative mb-4 transition-all duration-300 group-hover:scale-110 focus:outline-none focus:ring-4 focus:ring-accent/50"
              aria-label="Play  introduction video"
              onClick={handlePlay}
              disabled={isLoading}
            >
              <div className={`w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl ${
                isLoading ? 'animate-pulse' : 'animate-pulse'
              }`}>
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play size={24} className="text-white ml-1 fill-current" />
                )}
              </div>
              
              {/* Ripple effect */}
              {!isLoading && (
                <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping"></div>
              )}
            </button>

            {/* Watch CTA - Compact for Vertical */}
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-2">
                📱  Introduction
              </h3>
              <p className="text-white/90 text-sm mb-3 max-w-xs">
                {isLoading 
                  ? "Loading video..." 
                  : "Watch our  intro to ExpertResume"
                }
              </p>
              
              {/* YouTube Shorts Badge */}
              {!isLoading && (
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-full">
                    <span>📺</span>
                    <span>YouTube Short</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Video caption - Optimized for Vertical Video */}
      <div className="p-4 bg-gradient-to-br from-white to-gray-50">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📱  ExpertResume Introduction
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Watch our  YouTube Short to see how ExpertResume transforms careers with intelligent resume building.
          </p>
        </div>

        {/* Feature highlights - Compact for Vertical */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: "🤖", label: "AI Optimization", value: "98% ATS" },
            { icon: "⚡", label: "Build Time", value: "60 Sec" },
            { icon: "🎯", label: "Success Rate", value: "94%" },
            { icon: "💰", label: "Salary Boost", value: "+23%" },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-sm mb-1">{stat.icon}</div>
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-xs font-bold text-accent">{stat.value}</div>
            </div>
          ))}
        </div>

     
      </div>
    </div>
  );
}