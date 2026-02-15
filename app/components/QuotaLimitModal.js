"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, AlertTriangle, ArrowRight, CheckCircle, Zap } from "lucide-react";
import { ENTERPRISE_PLANS } from "../lib/enterprisePricing";
import { formatPrice } from "../lib/globalPricing";
import { getQuotaSummary } from "../lib/enterpriseQuotas";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const QuotaLimitModal = ({
  isOpen,
  onClose,
  quotaType,
  currentCount,
  limit,
  onUpgrade
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [quotaSummary, setQuotaSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      checkTeamMemberStatus();
      loadQuotaSummary();
    }
  }, [isOpen, user]);

  const checkTeamMemberStatus = async () => {
    try {
      const response = await fetch(`/api/get-user-profile?uid=${user.uid}`);
      if (response.ok) {
        const data = await response.json();

        // Check if user is a team member
        const isTeam = data.isTeamMember === true ||
          data.userType === "team_member" ||
          data.teamProfile?.role === "team_member" ||
          data.professionalProfile?.role === "team_member";

        setIsTeamMember(isTeam);

        // If team member, don't show the modal (close it)
        if (isTeam) {
          console.log("🚫 Team member detected - quota modal not applicable");
          onClose?.();
        }
      }
    } catch (error) {
      console.error("Error checking team member status:", error);
    }
  };

  const loadQuotaSummary = async () => {
    try {
      setLoading(true);
      const summary = await getQuotaSummary(user.uid);
      setQuotaSummary(summary);
    } catch (error) {
      console.error("Error loading quota summary:", error);
      toast.error("Failed to load quota information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    onUpgrade?.();
    router.push("/enterprise/checkout");
  };

  const getQuotaTypeInfo = (type) => {
    switch (type) {
      case "clients":
        return {
          title: "Client Limit Reached",
          description: "You've reached your monthly client limit",
          icon: "👥",
          action: "Create Client"
        };
      case "resumeUploads":
        return {
          title: "Resume Upload Limit Reached",
          description: "You've reached your monthly resume upload limit",
          icon: "📄",
          action: "Upload Resume"
        };
      case "atsChecks":
        return {
          title: "ATS Check Limit Reached",
          description: "You've reached your monthly ATS check limit",
          icon: "🔍",
          action: "Check ATS Score"
        };
      case "jdResumes":
        return {
          title: "JD Resume Limit Reached",
          description: "You've reached your monthly JD-based resume limit",
          icon: "🎯",
          action: "Create JD Resume"
        };
      case "teamMembers":
        return {
          title: "Team Member Limit Reached",
          description: "You've reached your team member limit",
          icon: "👨‍💼",
          action: "Add Team Member"
        };
      default:
        return {
          title: "Quota Limit Reached",
          description: "You've reached your usage limit",
          icon: "⚠️",
          action: "Continue"
        };
    }
  };

  const quotaInfo = getQuotaTypeInfo(quotaType);

  // Don't show modal for team members (they're always under Enterprise Pro)
  if (!isOpen || isTeamMember) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-2xl">
                {quotaInfo.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{quotaInfo.title}</h2>
                <p className="text-gray-600">{quotaInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Current Usage */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Usage</span>
                <span className="text-sm text-gray-500">
                  {currentCount} / {limit === -1 ? "Unlimited" : limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: limit === -1 ? "100%" : `${Math.min(100, (currentCount / limit) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Current Plan Info */}
            {quotaSummary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Current Plan</h3>
                <div className="bg-accent-50 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">{quotaSummary.plan.name}</h4>
                      <p className="text-sm text-accent-700">{quotaSummary.plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(quotaSummary.plan.price)}
                      </div>
                      <div className="text-sm text-accent">per month</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Options */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
              <div className="space-y-3">
                {Object.values(ENTERPRISE_PLANS).filter(plan => plan.id !== "free_trial").map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${plan.id === "business_pro"
                        ? "border-accent bg-accent-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => {
                      onClose();
                      router.push(`/enterprise/checkout?plan=${plan.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <Crown size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuotaLimitModal;
