"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Upload, 
  CheckCircle, 
  Target, 
  Crown, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Zap,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const QuotaUsageCard = ({ onUpgrade, refreshTrigger }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [quotaSummary, setQuotaSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQuotaSummary();
    }
  }, [user]);

  // Refresh quota data when component becomes visible (with debounce)
  useEffect(() => {
    let lastRefresh = 0;
    const minRefreshInterval = 60000; // 1 minute minimum between refreshes

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        const now = Date.now();
        if (now - lastRefresh >= minRefreshInterval) {
          console.log("🔄 Page became visible, refreshing quota data");
          loadQuotaSummary();
          lastRefresh = now;
        } else {
          console.log("⏳ Skipping refresh - too soon since last refresh");
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Auto-refresh every 5 minutes to keep data up to date
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing quota data");
      loadQuotaSummary();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && user) {
      console.log("🔄 Refresh trigger activated, reloading quota data");
      loadQuotaSummary();
    }
  }, [refreshTrigger, user]);

  // Get actual usage counts from API endpoint (server-side access)
  const getActualUsageSummary = async (userId) => {
    try {
      console.log("🔍 Getting actual usage counts from API for user:", userId);
      
      const response = await fetch(`/api/get-quota-usage?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const summary = await response.json();
      console.log("📊 Actual usage counts from API:", summary);
      return summary;
    } catch (error) {
      console.error("Error getting actual usage summary from API:", error);
      throw error; // Re-throw to let the calling function handle it
    }
  };

  const loadQuotaSummary = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading quota summary for user:", user.uid);
      
      // Always use the API to get real-time data
      const summary = await getActualUsageSummary(user.uid);
      console.log("📊 Quota summary loaded from API:", summary);
      setQuotaSummary(summary);
    } catch (error) {
      console.error("Error loading quota summary:", error);
      // Don't set any fallback data - let the component show loading/error state
      setQuotaSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const syncQuotas = async () => {
    try {
      setLoading(true);
      console.log("🔄 Syncing quotas with actual data for user:", user.uid);
      
      // First trigger a sync on the server
      const syncResponse = await fetch('/api/sync-quotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      if (syncResponse.ok) {
        console.log("✅ Server sync completed");
      } else {
        console.warn("⚠️ Server sync failed, but continuing with data load");
      }
      
      // Then load the updated data
      const summary = await getActualUsageSummary(user.uid);
      setQuotaSummary(summary);
    } catch (error) {
      console.error("Error syncing quotas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuotaIcon = (type) => {
    switch(type) {
      case "clients": return Users;
      case "resumeUploads": return Upload;
      case "atsChecks": return CheckCircle;
      case "jdResumes": return Target;
      case "teamMembers": return Crown;
      default: return TrendingUp;
    }
  };

  const getQuotaColor = (used, limit) => {
    if (limit === -1) return "text-green-600";
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const getProgressColor = (used, limit) => {
    if (limit === -1) return "from-green-500 to-green-600";
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "from-red-500 to-red-600";
    if (percentage >= 70) return "from-orange-500 to-orange-600";
    return "from-green-500 to-green-600";
  };

  const formatLimit = (limit) => {
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  const formatRemaining = (remaining) => {
    return remaining === "Unlimited" ? "∞" : remaining;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quotaSummary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="text-center text-gray-500">
          <AlertTriangle size={16} className="mx-auto mb-1" />
          <p className="text-xs">Unable to load quota information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Usage & Quotas</h3>
          <div className="text-xs text-gray-500">•</div>
          <div className="text-xs text-gray-600">{quotaSummary.plan.name}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={syncQuotas}
            disabled={loading}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
            title="Sync quotas"
          >
            <TrendingUp size={12} className={loading ? "animate-pulse" : ""} />
          </button>
          <button
            onClick={loadQuotaSummary}
            disabled={loading}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              console.log("🔄 Force refresh triggered");
              loadQuotaSummary();
            }}
            disabled={loading}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
            title="Force Refresh"
          >
            <Zap size={12} className={loading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {/* Compact Quota Items - Better Design */}
      <div className="space-y-2">
        {Object.entries(quotaSummary.quotas)
          .filter(([key]) => key !== 'teamMembers') // Remove team members for free trial
          .map(([key, quota]) => {
          const Icon = getQuotaIcon(key);
          const isAtLimit = quota.limit !== -1 && quota.used >= quota.limit;
          const isNearLimit = quota.limit !== -1 && (quota.used / quota.limit) >= 0.8;
          
          return (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                isAtLimit 
                  ? "bg-red-50 border border-red-200" 
                  : isNearLimit 
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isAtLimit ? "text-red-600" : isNearLimit ? "text-orange-600" : "text-blue-600"} />
                <div>
                  <div className="font-medium capitalize text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {quota.remaining === "Unlimited" ? "Unlimited" : `${quota.remaining} remaining`}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  isAtLimit ? "text-red-600" : isNearLimit ? "text-orange-600" : "text-gray-700"
                }`}>
                  {quota.used} / {formatLimit(quota.limit)}
                </div>
                {isAtLimit && (
                  <div className="text-xs text-red-500 font-medium">
                    Limit reached
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Features & Reset */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>
              Reset: {quotaSummary.resetDate ? 
                (quotaSummary.resetDate.toDate ? 
                  quotaSummary.resetDate.toDate().toLocaleDateString() : 
                  new Date(quotaSummary.resetDate).toLocaleDateString()
                ) : 'N/A'
              }
            </span>
          </div>
          {quotaSummary.isFreeTrial && (
            <button
              onClick={() => {
                onUpgrade?.();
                router.push("/enterprise/checkout");
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotaUsageCard;
