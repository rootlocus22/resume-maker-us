"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Crown,
  Target,
  Users,
  Code,
  Brain,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  Briefcase,
  Award,
  Clock,
  History,
  Plus,
  Trash2,
  Menu,
  X,
  Save
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { hasFeatureAccess } from "../lib/planFeatures";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function InterviewGyani() {
  const { isPremium, user, plan } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: "",
    field: "",
    experience: "",
    targetRole: ""
  });

  // State for plan access
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has access to Interview Simulation  (only for monthly and sixMonth plans)
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userPlan = userData.plan;

          // For oneDay and basic plans, block access
          if (userPlan === "oneDay" || userPlan === "basic") {
            setHasAccess(false);
            setShowUpgradeModal(true);
            return;
          }

          // For premium plan, check billing cycle from payment logs
          if (userPlan === "premium") {
            const response = await fetch(`/api/payment-logs?userId=${user.uid}`);
            if (response.ok) {
              const { transactions } = await response.json();
              const successfulPayments = transactions.filter(tx => tx.status === 'success');
              if (successfulPayments.length > 0) {
                successfulPayments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                const latestPayment = successfulPayments[0];
                const userBillingCycle = latestPayment.billingCycle;

                // Only allow monthly and sixMonth
                setHasAccess(userBillingCycle === "monthly" || userBillingCycle === "sixMonth");
                if (userBillingCycle === "oneDay" || userBillingCycle === "basic") {
                  setShowUpgradeModal(true);
                }
              }
            }
          } else {
            // For direct plan types
            setHasAccess(userPlan === "monthly" || userPlan === "sixMonth");
          }
        }
      } catch (error) {
        console.error('Error checking Interview Simulation  access:', error);
        setHasAccess(isPremium); // Fallback to isPremium check
      }
    };

    checkAccess();
  }, [user, plan, isPremium]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Interview modes
  const interviewModes = [
    {
      id: "behavioral",
      title: "Behavioral",
      icon: Users,
      description: "Practice real-world scenarios",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "technical",
      title: "Technical",
      icon: Code,
      description: "Field-specific questions",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "case-study",
      title: "Case Study",
      icon: Brain,
      description: "Problem-solving scenarios",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      premium: true
    },
    {
      id: "general",
      title: "General",
      icon: MessageSquare,
      description: "Mixed interview practice",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  // Load conversation history on mount
  useEffect(() => {
    if (user?.uid) {
      loadConversationHistory();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 50);
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      }
    };

    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
    }

    if (isTyping) {
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 200);
    }
  }, [messages, isTyping]);

  // Scroll to bottom when session starts
  useEffect(() => {
    if (sessionStarted && messages.length > 0) {
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTop = container.scrollHeight;
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 50);
        } else if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
          });
        }
      };

      setTimeout(scrollToBottom, 200);
      setTimeout(scrollToBottom, 400);
    }
  }, [sessionStarted, messages.length]);

  // Disable body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  // Save history to localStorage only (no Firebase)
  const saveHistoryToLocal = (historyData) => {
    try {
      localStorage.setItem(`interview_history_${user.uid}`, JSON.stringify(historyData));
    } catch (error) {
      console.error("Failed to save history to localStorage:", error);
    }
  };

  // Clean up invalid history entries
  const cleanupHistory = () => {
    const validHistory = conversationHistory.filter(item =>
      item.messages &&
      item.messages.length > 1 &&
      item.title &&
      item.title !== "Interview Session - Invalid Date" &&
      item.timestamp &&
      !isNaN(new Date(item.timestamp).getTime())
    );

    if (validHistory.length !== conversationHistory.length) {
      setConversationHistory(validHistory);
      saveHistoryToLocal(validHistory);
    }
  };

  // Load conversation history from localStorage only
  const loadConversationHistory = async () => {
    try {
      setIsLoading(true);

      const localHistory = localStorage.getItem(`interview_history_${user.uid}`);
      if (localHistory) {
        const parsed = JSON.parse(localHistory);
        const validHistory = parsed.filter(item =>
          item.messages &&
          item.messages.length > 1 &&
          item.title &&
          item.title !== "Interview Session - Invalid Date" &&
          item.timestamp &&
          !isNaN(new Date(item.timestamp).getTime())
        );
        setConversationHistory(validHistory);
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save conversation to history
  const saveToHistory = (sessionData) => {
    if (!sessionData.messages || sessionData.messages.length === 0) {
      return;
    }

    const lastMessage = sessionData.messages[sessionData.messages.length - 1];
    const validTitle = sessionData.title && sessionData.title !== "Interview Session - Invalid Date"
      ? sessionData.title
      : `${sessionData.mode} Interview - ${sessionData.userProfile?.field || 'General'}`;

    const historyItem = {
      id: sessionData.id,
      title: validTitle,
      mode: sessionData.mode,
      userProfile: sessionData.userProfile,
      messages: sessionData.messages,
      timestamp: sessionData.timestamp || Date.now(),
      lastMessage: lastMessage?.content || "Conversation started"
    };

    const newHistory = [
      historyItem,
      ...conversationHistory.filter(h => h.id !== sessionData.id)
    ].slice(0, 10);

    setConversationHistory(newHistory);
    saveHistoryToLocal(newHistory);
  };

  // Resume conversation
  const resumeConversation = (historyItem) => {
    setMessages(historyItem.messages);
    setUserProfile(historyItem.userProfile);
    setCurrentSessionId(historyItem.id);
    setSessionStarted(true);
    setShowHistory(false);
    setSidebarOpen(false);
    toast.success("Resumed previous conversation");
  };

  // Delete conversation from history
  const deleteConversation = (historyId) => {
    const newHistory = conversationHistory.filter(h => h.id !== historyId);
    setConversationHistory(newHistory);
    saveHistoryToLocal(newHistory);
    toast.success("Conversation deleted from history");
  };

  // Start interview session
  const startInterview = async (mode) => {
    if (!userProfile.name || !userProfile.field) {
      toast.error("Please fill in your name and field");
      return;
    }

    if (mode.premium && !isPremium) {
      toast.error("Premium feature! Upgrade to access this mode.");
      return;
    }

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    setSessionStarted(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/interview-pro/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          mode: mode.id,
          userProfile,
          sessionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        const initialMessage = {
          id: "1",
          role: "assistant",
          content: data.question.text,
          timestamp: Date.now()
        };

        setMessages([initialMessage]);

        saveToHistory({
          id: sessionId,
          title: `${mode.title} Interview - ${userProfile.field}`,
          mode: mode.id,
          userProfile,
          messages: [initialMessage],
          timestamp: Date.now()
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to start interview");
      setSessionStarted(false);
    } finally {
      setIsTyping(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/interview-pro/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          userResponse: input.trim(),
          conversationHistory: messages,
          sessionId: currentSessionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: Date.now()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        if (currentSessionId) {
          const historyItem = conversationHistory.find(h => h.id === currentSessionId);
          if (historyItem) {
            saveToHistory({
              ...historyItem,
              messages: finalMessages,
              lastMessage: aiMessage.content
            });
          }
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to get response");
    } finally {
      setIsTyping(false);
    }
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset session
  const resetSession = () => {
    setMessages([]);
    setSessionStarted(false);
    setInput("");
    setIsTyping(false);
    setCurrentSessionId(null);
  };

  // Sidebar component
  const Sidebar = () => (
    <div className="bg-white border-r border-gray-200 w-80 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Interview History</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading history...</p>
          </div>
        ) : (
          <>
            {conversationHistory
              .filter(item =>
                item.messages &&
                item.messages.length > 1 &&
                item.title &&
                item.title !== "Interview Session - Invalid Date"
              )
              .map((item) => {
                const timestamp = new Date(item.timestamp);
                const isValidDate = !isNaN(timestamp.getTime());
                const displayDate = isValidDate
                  ? timestamp.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : 'Recent';

                const messageCount = item.messages?.length || 0;
                const lastMessage = item.lastMessage ||
                  (item.messages && item.messages.length > 0
                    ? item.messages[item.messages.length - 1]?.content
                    : 'Conversation started');

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${currentSessionId === item.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    onClick={() => resumeConversation(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600 truncate mt-1">{lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {displayDate} • {item.mode} • {messageCount} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(item.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all ml-2"
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

            {conversationHistory.filter(item =>
              item.messages &&
              item.messages.length > 1 &&
              item.title &&
              item.title !== "Interview Session - Invalid Date"
            ).length === 0 && (
                <div className="text-center py-8">
                  <History className="text-gray-300 mx-auto mb-3" size={48} />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start your first interview to see history here</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );

  // Show upgrade modal if user doesn't have access to Interview Pro
  if (showUpgradeModal && !hasAccess && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade to Pro for Interview Gyani
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              The Interview Simulation  feature is only available for <strong>Pro Monthly (₹499)</strong> and <strong>Pro 6-Month (₹899)</strong> plans.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Unlock with Pro Plans:</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span>JD Builder - Tailor to Any Job</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span>ExpertResume GPT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span>Salary Analyzer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span>Unlimited Downloads</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/checkout?billingCycle=monthly')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Upgrade to Pro Monthly
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                View All Plans
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Interview Gyani</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {!sessionStarted ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* User Profile Setup */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Field</label>
                      <input
                        type="text"
                        value={userProfile.field}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, field: e.target.value }))}
                        placeholder="e.g., Marketing, Engineering, Design, Sales"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                      <select
                        value={userProfile.experience}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      >
                        <option value="">Select experience</option>
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (3-5 years)</option>
                        <option value="senior">Senior Level (6+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                      <input
                        type="text"
                        value={userProfile.targetRole}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, targetRole: e.target.value }))}
                        placeholder="e.g., Senior Marketing Manager"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Modes */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="text-purple-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Choose Interview Type</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {interviewModes.map((mode) => (
                      <motion.div
                        key={mode.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startInterview(mode)}
                        className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all min-h-[140px] flex flex-col justify-center ${mode.premium && !isPremium
                            ? "border-gray-200 bg-white opacity-60"
                            : `${mode.bgColor} ${mode.borderColor} hover:shadow-lg hover:scale-105`
                          }`}
                      >
                        {mode.premium && !isPremium && (
                          <div className="absolute -top-2 -right-2">
                            <Crown className="text-amber-500" size={20} />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color} text-white`}>
                            <mode.icon size={24} />
                          </div>
                          <h3 className="text-lg font-semibold">{mode.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{mode.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Premium Features */}
                {!isPremium && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                        <Crown className="text-amber-600" size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlock Premium Features</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Get access to advanced interview modes, detailed analytics, and unlimited practice sessions.
                      </p>
                      <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg">
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Interview Session</h2>
                      <p className="text-gray-600 text-sm">
                        {userProfile.name} • {userProfile.field} • {userProfile.experience} level
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetSession}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                      }`}>
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-6 flex-shrink-0 pb-20">
                <div className="max-w-4xl mx-auto flex gap-4">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                    rows={2}
                    disabled={isTyping}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`p-4 rounded-xl font-medium transition-all flex-shrink-0 ${input.trim() && !isTyping
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Mobile Content */}
        {!sessionStarted ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Mobile History */}
            {conversationHistory.filter(item =>
              item.messages &&
              item.messages.length > 1 &&
              item.title &&
              item.title !== "Interview Session - Invalid Date"
            ).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <History className="text-green-600" size={24} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Recent Conversations</h2>
                    </div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      {showHistory ? <ArrowRight size={20} /> : <History size={20} />}
                    </button>
                  </div>

                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3"
                    >
                      {conversationHistory
                        .filter(item =>
                          item.messages &&
                          item.messages.length > 1 &&
                          item.title &&
                          item.title !== "Interview Session - Invalid Date"
                        )
                        .map((item) => {
                          const timestamp = new Date(item.timestamp);
                          const isValidDate = !isNaN(timestamp.getTime());
                          const displayDate = isValidDate
                            ? timestamp.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : 'Recent';

                          const messageCount = item.messages?.length || 0;
                          const lastMessage = item.lastMessage ||
                            (item.messages && item.messages.length > 0
                              ? item.messages[item.messages.length - 1]?.content
                              : 'Conversation started');

                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {displayDate} • {item.mode} • {messageCount} messages
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => resumeConversation(item)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Resume conversation"
                                >
                                  <MessageSquare size={18} />
                                </button>
                                <button
                                  onClick={() => deleteConversation(item.id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete conversation"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </motion.div>
                  )}
                </div>
              )}

            {/* Mobile Profile Setup */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tell us about yourself</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Field</label>
                  <input
                    type="text"
                    value={userProfile.field}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="e.g., Marketing, Engineering, Design, Sales"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={userProfile.experience}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="">Select experience</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                  <input
                    type="text"
                    value={userProfile.targetRole}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, targetRole: e.target.value }))}
                    placeholder="e.g., Senior Marketing Manager"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Interview Modes */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Choose Interview Type</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {interviewModes.map((mode) => (
                  <motion.div
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startInterview(mode)}
                    className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all min-h-[140px] flex flex-col justify-center ${mode.premium && !isPremium
                        ? "border-gray-200 bg-white opacity-60"
                        : `${mode.bgColor} ${mode.borderColor} hover:shadow-lg hover:scale-105`
                      }`}
                  >
                    {mode.premium && !isPremium && (
                      <div className="absolute -top-2 -right-2">
                        <Crown className="text-amber-500" size={20} />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${mode.color} text-white`}>
                        <mode.icon size={24} />
                      </div>
                      <h3 className="text-lg font-semibold">{mode.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{mode.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile Premium Features */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <Crown className="text-amber-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Unlock Premium Features</h3>
                  <p className="text-gray-600 mb-6">
                    Get access to advanced interview modes, detailed analytics, and unlimited practice sessions.
                  </p>
                  <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg">
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Interview Session</h2>
                    <p className="text-gray-600 text-sm">
                      {userProfile.name} • {userProfile.field} • {userProfile.experience} level
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetSession}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                    }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Mobile Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Input - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 pb-20">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className={`p-3 rounded-xl font-medium transition-all flex-shrink-0 ${input.trim() && !isTyping
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 