"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  Loader2,
  Shield,
  ArrowLeft,
  BarChart3,
  Filter,
  Search,
  Mail,
  Calendar,
  Globe,
  Monitor,
  User,
  FileText,
  ExternalLink,
  Download,
  X,
} from "lucide-react";
import Link from "next/link";
import AuthProtection from "../../components/AuthProtection";

const SUPER_ADMIN_EMAIL = "rahuldubey220890@gmail.com";

function FeedbackDashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([SUPER_ADMIN_EMAIL]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [allFeedbackData, setAllFeedbackData] = useState([]);
  const [timeRange, setTimeRange] = useState("daily"); // daily, weekly, monthly, quarterly
  const [activeTab, setActiveTab] = useState("overview"); // overview, details
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all"); // all, 1, 2, 3, 4, 5
  const [filterType, setFilterType] = useState("all"); // all, general, bug, feature, improvement, download_survey
  const [filterContext, setFilterContext] = useState("all"); // all, resume-builder, ats-checker, post_download, general
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, rating-high, rating-low
  const [showAdminManager, setShowAdminManager] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [managingAdmins, setManagingAdmins] = useState(false);

  // Fetch allowed emails and check authorization
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch allowed emails from database
        const response = await fetch("/api/admin/allowed-emails");
        const data = await response.json();
        
        if (data.success) {
          const emails = data.allowedEmails || [SUPER_ADMIN_EMAIL];
          setAllowedEmails(emails);
          
          // Check if user is authorized
          const userEmail = user.email?.toLowerCase().trim();
          const isAuthorized = emails.includes(userEmail);
          setAuthorized(isAuthorized);
          setIsSuperAdmin(userEmail === SUPER_ADMIN_EMAIL);
          
          if (isAuthorized) {
            fetchDashboardData();
          } else {
            setLoading(false);
          }
        } else {
          // Fallback to super admin only
          const userEmail = user.email?.toLowerCase().trim();
          const isAuthorized = userEmail === SUPER_ADMIN_EMAIL;
          setAuthorized(isAuthorized);
          setIsSuperAdmin(isAuthorized);
          
          if (isAuthorized) {
            fetchDashboardData();
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
        // Fallback to super admin only
        const userEmail = user.email?.toLowerCase().trim();
        const isAuthorized = userEmail === SUPER_ADMIN_EMAIL;
        setAuthorized(isAuthorized);
        setIsSuperAdmin(isAuthorized);
        
        if (isAuthorized) {
          fetchDashboardData();
        } else {
          setLoading(false);
        }
      }
    };

    checkAccess();
  }, [user]);

  // Re-fetch dashboard data when timeRange changes
  useEffect(() => {
    if (authorized) {
      fetchDashboardData();
    }
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [feedbackRes, analysisRes, allFeedbackRes] = await Promise.all([
        fetch("/api/feedback"),
        fetch("/api/feedback-analysis"),
        fetch(`/api/feedback/all?limit=1000&timeRange=${timeRange}`),
      ]);

      const feedbackData = await feedbackRes.json();
      const analysisData = await analysisRes.json();
      const allFeedbackDataResult = await allFeedbackRes.json();

      // Calculate time-based metrics
      const now = new Date();
      const timeRanges = {
        daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarterly: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      };

      const rangeStart = timeRanges[timeRange];
      const allFeedback = analysisData.analysis?.overview?.totalFeedback || 0;

      // Filter feedback by time range
      const filteredFeedback = feedbackData.feedback?.filter((f) => {
        const timestamp = new Date(f.timestamp);
        return timestamp >= rangeStart;
      }) || [];

      const filteredRatings = filteredFeedback.map((f) => f.rating || 0);
      const avgRating = filteredRatings.length > 0
        ? filteredRatings.reduce((a, b) => a + b, 0) / filteredRatings.length
        : 0;

      setDashboardData({
        ...analysisData.analysis,
        timeRangeData: {
          count: filteredFeedback.length,
          avgRating: parseFloat(avgRating.toFixed(2)),
          positiveCount: filteredFeedback.filter((f) => (f.rating || 0) >= 4).length,
          negativeCount: filteredFeedback.filter((f) => (f.rating || 0) <= 2).length,
        },
        allFeedback: feedbackData.feedback || [],
      });

      // Set all feedback data with full user details
      setAllFeedbackData(allFeedbackDataResult.feedback || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort feedback
  const filteredFeedback = allFeedbackData
    .filter((f) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          f.name,
          f.email,
          f.userProfile?.email,
          f.comment,
          f.userProfile?.jobTitle,
          f.userProfile?.company,
          f.context,
          f.feedbackType,
        ].join(" ").toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      // Rating filter
      if (filterRating !== "all" && f.rating !== parseInt(filterRating)) return false;

      // Type filter
      if (filterType !== "all" && f.feedbackType !== filterType) return false;

      // Context filter
      if (filterContext !== "all" && f.context !== filterContext) return false;

      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();

      switch (sortBy) {
        case "newest":
          return bTime - aTime;
        case "oldest":
          return aTime - bTime;
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0);
        default:
          return bTime - aTime;
      }
    });

  // Handle adding new admin email
  const handleAddAdminEmail = async () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      return;
    }

    setManagingAdmins(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/allowed-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setAllowedEmails(data.allowedEmails);
        setNewAdminEmail("");
        setShowAdminManager(false);
      } else {
        alert(data.error || "Failed to add email");
      }
    } catch (error) {
      console.error("Error adding admin email:", error);
      alert("Failed to add email");
    } finally {
      setManagingAdmins(false);
    }
  };

  // Handle removing admin email
  const handleRemoveAdminEmail = async (emailToRemove) => {
    if (!confirm(`Remove ${emailToRemove} from admin access?`)) {
      return;
    }

    setManagingAdmins(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/allowed-emails?email=${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAllowedEmails(data.allowedEmails);
      } else {
        alert(data.error || "Failed to remove email");
      }
    } catch (error) {
      console.error("Error removing admin email:", error);
      alert("Failed to remove email");
    } finally {
      setManagingAdmins(false);
    }
  };

  if (loading && authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authorized && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-2">
            This dashboard is only accessible to authorized administrators.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mb-6">
              You are signed in as: <strong className="text-gray-700">{user.email}</strong>
            </p>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const { overview, painPoints, negativeFeedback, suggestions, recommendations, timeRangeData } =
    dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Monitoring Dashboard</h1>
              <p className="text-gray-600 mt-1">Track user feedback and satisfaction metrics</p>
            </div>
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <button
                  onClick={() => setShowAdminManager(!showAdminManager)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Users size={16} />
                  Manage Admins
                </button>
              )}
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
      </div>

      {/* Admin Manager Modal */}
      {showAdminManager && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manage Admin Access</h2>
                  <p className="text-gray-600 mt-1">Add or remove email addresses with dashboard access</p>
                </div>
                <button
                  onClick={() => setShowAdminManager(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Add New Admin */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Admin</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAdminEmail()}
                  />
                  <button
                    onClick={handleAddAdminEmail}
                    disabled={managingAdmins || !newAdminEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {managingAdmins ? <Loader2 size={16} className="animate-spin" /> : "Add"}
                  </button>
                </div>
              </div>

              {/* Current Admins List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Admins ({allowedEmails.length})</h3>
                <div className="space-y-2">
                  {allowedEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-900">{email}</span>
                        {email === SUPER_ADMIN_EMAIL && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Super Admin
                          </span>
                        )}
                      </div>
                      {email !== SUPER_ADMIN_EMAIL && (
                        <button
                          onClick={() => handleRemoveAdminEmail(email)}
                          disabled={managingAdmins}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm inline-flex">
            {["daily", "weekly", "monthly", "quarterly"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Overview & Insights
                </div>
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  Detailed Feedback
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {filteredFeedback.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" ? (
          <OverviewTab
            overview={overview}
            timeRangeData={timeRangeData}
            painPoints={painPoints}
            negativeFeedback={negativeFeedback}
            suggestions={suggestions}
            recommendations={recommendations}
          />
        ) : (
          <DetailsTab
            feedback={filteredFeedback}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterRating={filterRating}
            setFilterRating={setFilterRating}
            filterType={filterType}
            setFilterType={setFilterType}
            filterContext={filterContext}
            setFilterContext={setFilterContext}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ overview, timeRangeData, painPoints, negativeFeedback, suggestions, recommendations }) {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Feedback"
          value={overview?.totalFeedback || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Recent Feedback"
          value={timeRangeData?.count || 0}
          icon={<MessageSquare className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Average Rating"
          value={overview?.avgRating?.toFixed(1) || "0.0"}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          subtitle={`Recent: ${overview?.recentAvgRating?.toFixed(1) || "0.0"}`}
        />
        <StatCard
          title="Negative Feedback"
          value={`${negativeFeedback?.percentage || 0}%`}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          subtitle={`${negativeFeedback?.count || 0} total`}
        />
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rating Distribution</h2>
        <div className="grid grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = overview?.ratingDistribution?.[rating] || 0;
            const percentage = overview?.totalFeedback
              ? (count / overview.totalFeedback) * 100
              : 0;
            return (
              <div key={rating} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{count}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      rating >= 4 ? "bg-green-500" : rating === 3 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {rating} ⭐ ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Common Pain Points</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(painPoints || {}).map(([key, value]) => (
            <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
              <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Action Items</h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === "high"
                    ? "bg-red-50 border-red-500"
                    : rec.priority === "medium"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{rec.category}</span>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{rec.issue}</p>
                    <p className="text-sm text-gray-600">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Negative Feedback */}
      {negativeFeedback?.comments && negativeFeedback.comments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Negative Feedback</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {negativeFeedback.comments.slice(0, 10).map((feedback, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-red-700">
                      {feedback.name || feedback.userProfile?.displayName || "Anonymous"}
                    </span>
                    {feedback.userProfile?.email && (
                      <span className="text-xs text-gray-600">({feedback.userProfile.email})</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </span>
                    {feedback.userProfile?.plan && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {feedback.userProfile.plan}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-2">{feedback.comment}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
                  {feedback.context && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">Context: {feedback.context}</span>
                  )}
                  {feedback.feedbackType && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">Type: {feedback.feedbackType}</span>
                  )}
                  {feedback.userProfile?.jobTitle && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">Role: {feedback.userProfile.jobTitle}</span>
                  )}
                  {feedback.userProfile?.company && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">Company: {feedback.userProfile.company}</span>
                  )}
                  {feedback.pageUrl && (
                    <a
                      href={feedback.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Page
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Suggestions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-700">
                    {suggestion.name || "Anonymous"}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < suggestion.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{suggestion.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Details Tab Component
function DetailsTab({
  feedback,
  searchQuery,
  setSearchQuery,
  filterRating,
  setFilterRating,
  filterType,
  setFilterType,
  filterContext,
  setFilterContext,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="download_survey">Download Survey</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Context Filter */}
          <div className="relative">
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Contexts</option>
              <option value="resume-builder">Resume Builder</option>
              <option value="ats-checker">ATS Checker</option>
              <option value="post_download">Post Download</option>
              <option value="general">General</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort and Count */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            Showing {feedback.length} feedback {feedback.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No feedback found matching your filters.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <FeedbackCard key={item.id} feedback={item} />
          ))
        )}
      </div>
    </div>
  );
}

// Feedback Card Component
function FeedbackCard({ feedback }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rating = feedback.rating || 0;
  const isNegative = rating <= 2;
  const isPositive = rating >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-sm border-2 overflow-hidden ${
        isNegative
          ? "bg-red-50 border-red-200"
          : isPositive
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(feedback.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                {feedback.name || feedback.userProfile?.displayName || "Anonymous"}
              </span>
              {(feedback.email || feedback.userProfile?.email) && (
                <span className="text-sm text-gray-600">
                  ({feedback.email || feedback.userProfile?.email})
                </span>
              )}
              {feedback.userProfile?.plan && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {feedback.userProfile.plan}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>

        {/* Comment */}
        <p className="text-gray-700 mb-4">{feedback.comment}</p>

        {/* Quick Info Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {feedback.feedbackType && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {feedback.feedbackType}
            </span>
          )}
          {feedback.context && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {feedback.context}
            </span>
          )}
          {feedback.source && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {feedback.source}
            </span>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-3"
          >
            {/* User Profile Info */}
            {feedback.userProfile && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} />
                  User Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {feedback.userProfile.jobTitle && (
                    <div>
                      <span className="text-gray-600">Job Title:</span>
                      <span className="ml-2 font-medium">{feedback.userProfile.jobTitle}</span>
                    </div>
                  )}
                  {feedback.userProfile.company && (
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium">{feedback.userProfile.company}</span>
                    </div>
                  )}
                  {feedback.userProfile.plan && (
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <span className="ml-2 font-medium">{feedback.userProfile.plan}</span>
                    </div>
                  )}
                  {feedback.userProfile.premiumExpiry && (
                    <div>
                      <span className="text-gray-600">Premium Expiry:</span>
                      <span className="ml-2 font-medium">
                        {new Date(feedback.userProfile.premiumExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Monitor size={16} />
                Technical Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {feedback.pageUrl && (
                  <div>
                    <span className="text-gray-600">Page URL:</span>
                    <a
                      href={feedback.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {feedback.pageUrl.length > 50
                        ? feedback.pageUrl.substring(0, 50) + "..."
                        : feedback.pageUrl}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {feedback.referrer && (
                  <div>
                    <span className="text-gray-600">Referrer:</span>
                    <span className="ml-2 font-medium text-xs">{feedback.referrer}</span>
                  </div>
                )}
                {feedback.screenResolution && (
                  <div>
                    <span className="text-gray-600">Screen:</span>
                    <span className="ml-2 font-medium">{feedback.screenResolution}</span>
                  </div>
                )}
                {feedback.platform && (
                  <div>
                    <span className="text-gray-600">Platform:</span>
                    <span className="ml-2 font-medium">{feedback.platform}</span>
                  </div>
                )}
                {feedback.timezone && (
                  <div>
                    <span className="text-gray-600">Timezone:</span>
                    <span className="ml-2 font-medium">{feedback.timezone}</span>
                  </div>
                )}
                {feedback.language && (
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <span className="ml-2 font-medium">{feedback.language}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {feedback.userProfile?.email && (
                <a
                  href={`mailto:${feedback.userProfile.email}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Mail size={16} />
                  Send Email
                </a>
              )}
              {feedback.pageUrl && (
                <a
                  href={feedback.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <ExternalLink size={16} />
                  View Page
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color, subtitle }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </motion.div>
  );
}

export default function FeedbackDashboard() {
  return (
    <AuthProtection>
      <FeedbackDashboardContent />
    </AuthProtection>
  );
}
