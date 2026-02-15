"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthProtection from "../components/AuthProtection";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { 
  Copy, 
  Mail, 
  Phone, 
  Share2, 
  UserPlus, 
  Gift, 
  CheckCircle, 
  Clock, 
  CreditCard,
  Users,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Building2,
  Target,
  Heart,
  Sparkles,
  DollarSign,
  Award,
  Rocket,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

function ReferAndEarnContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    registeredReferrals: 0,
    paidReferrals: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (user) {
      initializeReferralData();
    }
  }, [user]);

  const initializeReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch or generate referral code
      const response = await fetch("/api/generate-referral-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid })
      });
      
      const data = await response.json();
      
      if (data.referralCode) {
        setReferralCode(data.referralCode);
        const link = `${window.location.origin}/signup?ref=${data.referralCode}`;
        setReferralLink(link);
      }

      // Fetch referral list and stats
      await fetchReferrals();
    } catch (error) {
      console.error("Error initializing referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`/api/get-referrals?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.referrals) {
        setReferrals(data.referrals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const handleSendInvite = async () => {
    if (!friendEmail && !friendPhone) {
      toast.error("Please provide at least email or phone number");
      return;
    }

    if (friendEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (friendPhone && !/^\+?[\d\s-]{10,}$/.test(friendPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSendingInvite(true);

      const response = await fetch("/api/send-referral-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          referralCode,
          referralLink,
          friendEmail: friendEmail || null,
          friendPhone: friendPhone || null,
          friendName: friendName || "Friend",
          referrerName: user.displayName || "Your friend"
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Invitation sent successfully!");
        setFriendEmail("");
        setFriendPhone("");
        setFriendName("");
        await fetchReferrals();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleWhatsAppShare = () => {
    const userName = user.displayName || "Your friend";
    const message = encodeURIComponent(
      `Hey!\n\nI recently used ExpertResume to create my resume and wanted to share it with you.\n\nIt helped me build a professional, ATS-optimized resume in just a few minutes using AI. Thought it might be useful for you too!\n\nHere's my referral link - you'll get 15% off:\n${referralLink}\n\nWhat I really liked:\n• Upload your old resume and AI reorganizes it\n• Gets past those ATS screening systems\n• Job Description Resume Builder - tailors your resume for specific jobs\n• Resume GPT - AI chat assistant for resume questions\n• Professional templates that actually look good\n• Also helps with cover letters\n\nNo pressure - just sharing in case you're job hunting or updating your resume!\n\nCheers,\n${userName.split(' ')[0]}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const getStatusBadge = (status) => {
    const badges = {
      invited: { color: "bg-gray-100 text-gray-700", icon: <Clock className="w-3 h-3" />, text: "Invited" },
      registered: { color: "bg-blue-100 text-blue-700", icon: <UserPlus className="w-3 h-3" />, text: "Registered" },
      paid: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" />, text: "Paid" }
    };
    
    const badge = badges[status] || badges.invited;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-xs sm:text-sm font-semibold text-purple-700">Transform Lives & Earn Money</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Refer & Earn with
            <span className="block mt-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ExpertResume
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4 px-4">
            Earn ₹100 for every 3 paid referrals • Help others land their dream jobs
          </p>
          
          {/* Learn More Banner */}
          <a 
            href="/faqs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:from-gray-900 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
          >
            <Rocket className="w-5 h-5" />
            FAQs
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Referrals</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Registered</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.registeredReferrals}</p>
              </div>
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Paid Users</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.paidReferrals}</p>
              </div>
              <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">₹{stats.totalEarnings}</p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
            </div>
          </div>
        </div>


        {/* Earnings Progress Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 shadow-md border border-purple-200 mb-8 sm:mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              Your Earnings Progress
            </h3>
            <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-300">
              <span className="text-xs sm:text-sm font-semibold text-purple-700">₹100 per 3 referrals</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Current Earnings */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">You've Earned</p>
              <p className="text-3xl font-bold text-purple-600">₹{stats.totalEarnings}</p>
              <p className="text-xs text-gray-500 mt-1">from {stats.paidReferrals} paid {stats.paidReferrals === 1 ? 'referral' : 'referrals'}</p>
            </div>

            {/* Next Milestone */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Next ₹100 Milestone</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.paidReferrals % 3 === 0 ? 3 : (3 - (stats.paidReferrals % 3))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                more {(stats.paidReferrals % 3 === 0 ? 3 : (3 - (stats.paidReferrals % 3))) === 1 ? 'referral' : 'referrals'} needed
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-2">Progress to Next ₹100</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {stats.paidReferrals % 3}/3
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {Math.round(((stats.paidReferrals % 3) / 3) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: `${((stats.paidReferrals % 3) / 3) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {stats.paidReferrals % 3 === 0 
                  ? '🎯 Start your next milestone!' 
                  : `${3 - (stats.paidReferrals % 3)} more to go!`}
              </p>
            </div>
          </div>

          {/* Earnings Projection */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">💰 Earnings Calculator:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-xs">3 referrals</p>
                <p className="font-bold text-green-600 text-sm sm:text-base">₹100</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-xs">6 referrals</p>
                <p className="font-bold text-green-600 text-sm sm:text-base">₹200</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-xs">9 referrals</p>
                <p className="font-bold text-green-600 text-sm sm:text-base">₹300</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-xs">12 referrals</p>
                <p className="font-bold text-green-600 text-sm sm:text-base">₹400</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Referral Link & Invite */}
          <div className="space-y-4 sm:space-y-6">
            {/* Referral Link Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Your Referral Link
              </h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 mb-4 border border-blue-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Your unique referral code:</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-3 sm:mb-4">{referralCode}</p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                    <span className="sm:hidden">Copy</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleWhatsAppShare}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share on WhatsApp
              </button>
            </div>

            {/* Invite Friend Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Invite a Friend
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Friend's Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={friendPhone}
                    onChange={(e) => setFriendPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <button
                  onClick={handleSendInvite}
                  disabled={sendingInvite}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  {sendingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </div>

            {/* Rewards Info */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200 shadow-md">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                🎁 How It Works
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>They get <strong className="text-purple-700">15% OFF</strong> on their first purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>You earn <strong className="text-purple-700">₹100 for every 3 paid referrals</strong> (monthly plan or higher)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Earnings calculated proportionally and rounded off</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Use earnings for plan renewals or upgrades!</span>
                </li>
              </ul>
              
              <div className="mt-3 sm:mt-4 p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
                <p className="text-xs sm:text-sm font-semibold text-purple-700 mb-2">💡 Earnings Example:</p>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>3 paid referrals:</span>
                    <span className="font-bold text-green-600">₹100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>6 paid referrals:</span>
                    <span className="font-bold text-green-600">₹200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>9 paid referrals:</span>
                    <span className="font-bold text-green-600">₹300</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span>10 paid referrals:</span>
                    <span className="font-bold text-green-600">₹300</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 italic mt-2">
                    *You earn ₹100 for every complete set of 3 paid referrals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Referral List */}
          <div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Your Referrals ({referrals.length})
              </h2>
              
              {referrals.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">No referrals yet. Start inviting friends!</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">Share your link above to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-2">
                  {referrals.map((referral, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {referral.friendName || "Friend"}
                          </p>
                          {referral.email && (
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{referral.email}</span>
                            </p>
                          )}
                          {referral.phone && (
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              {referral.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(referral.status)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>
                          Invited: {new Date(referral.createdAt).toLocaleDateString()}
                        </span>
                        {referral.convertedAt && (
                          <span className="text-green-600 font-medium">
                            Paid: {new Date(referral.convertedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReferAndEarn() {
  return (
    <AuthProtection>
      <ReferAndEarnContent />
    </AuthProtection>
  );
}
