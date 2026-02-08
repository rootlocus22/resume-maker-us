"use client";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { FiSend, FiRefreshCw, FiStar, FiBookOpen, FiChevronDown, FiChevronUp, FiCopy, FiX, FiClock, FiUser, FiAward } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { event } from "../lib/gtag";
import katex from "katex";
import "katex/dist/katex.min.css";

// Input Component (Separated to isolate input state)
const InputForm = memo(({ userId, activeMode, userDetails, isLoading, onSubmit }) => {
  const [input, setInput] = useState("");

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userId || !input.trim() || isLoading) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleChatSubmit} className="relative">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          !userId
            ? "Please log in to start..."
            : activeMode === "interview"
            ? "Your response..."
            : "What do you want to explore next?"
        }
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-gray-50 min-h-[50px] max-h-[120px] shadow-inner transition-all"
        disabled={isLoading || !userId}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading || !userId}
        className={`absolute right-2 bottom-2 p-1.5 rounded-md transition-all ${
          input.trim() && !isLoading && userId
            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <FiSend size={16} />
      </button>
    </form>
  );
});

// Memoized Message Bubble Component
const MessageBubble = memo(({ message }) => {
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!", { duration: 2000 });
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy text.");
    });
  };

  const renderMessageContent = (content) => {
    // First, handle code blocks to preserve them
    const codeParts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let codeMatch;

    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      if (codeMatch.index > lastIndex) {
        codeParts.push({ type: "text", content: content.slice(lastIndex, codeMatch.index) });
      }
      codeParts.push({ type: "code", content: codeMatch[1].trim() });
      lastIndex = codeMatch.index + codeMatch[0].length;
    }
    if (lastIndex < content.length) {
      codeParts.push({ type: "text", content: content.slice(lastIndex) });
    }

    // Process each part for LaTeX and Markdown
    const finalParts = [];
    for (const part of codeParts) {
      if (part.type === "code") {
        finalParts.push(part);
        continue;
      }

      let text = part.content;
      // Handle LaTeX
      const latexParts = [];
      let latexLastIndex = 0;
      const latexRegex = /(\\\([^]+?\\\))|(\\\[.+?\\\])/gs;
      let latexMatch;

      while ((latexMatch = latexRegex.exec(text)) !== null) {
        if (latexMatch.index > latexLastIndex) {
          latexParts.push({ type: "text", content: text.slice(latexLastIndex, latexMatch.index) });
        }
        const isInline = latexMatch[1] !== undefined;
        const latexContent = isInline ? latexMatch[1].slice(2, -2) : latexMatch[2].slice(2, -2);
        latexParts.push({ type: "latex", content: latexContent, inline: isInline });
        latexLastIndex = latexMatch.index + latexMatch[0].length;
      }
      if (latexLastIndex < text.length) {
        latexParts.push({ type: "text", content: text.slice(latexLastIndex) });
      }

      // Process Markdown in text parts
      for (const latexPart of latexParts) {
        if (latexPart.type === "latex") {
          finalParts.push(latexPart);
          continue;
        }

        let markdownText = latexPart.content;
        // Handle headings (#, ##, ###)
        markdownText = markdownText.replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
                                  .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
                                  .replace(/^#\s(.+)$/gm, '<h1>$1</h1>');
        
        // Handle bold (**text**)
        markdownText = markdownText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic (*text* or _text_)
        markdownText = markdownText.replace(/(?:\*|_)(.+?)(?:\*|_)/g, '<em>$1</em>');

        // Split by lines and process
        const lines = markdownText.split('\n');
        lines.forEach((line, idx) => {
          if (line.trim()) {
            finalParts.push({ type: "text", content: line.trim(), newLine: idx > 0 });
          }
        });
      }
    }

    return finalParts.map((part, index) => {
      if (part.type === "latex") {
        return (
          <span key={index} className={part.inline ? "inline-block mx-1" : "block my-2 text-center"}>
            <span dangerouslySetInnerHTML={{ __html: katex.renderToString(part.content, { displayMode: !part.inline, throwOnError: false }) }} />
          </span>
        );
      } else if (part.type === "code") {
        return (
          <pre key={index} className="bg-gray-800 text-white p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono">
            <code>{part.content}</code>
          </pre>
        );
      } else {
        return (
          <span key={index} className="block text-sm leading-relaxed">
            {part.newLine && <br />}
            <span dangerouslySetInnerHTML={{ __html: part.content }} />
          </span>
        );
      }
    });
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div className={`max-w-[90%] overflow-x-auto rounded-xl p-3 relative ${
        message.role === "user" 
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
          : "bg-white text-gray-800 shadow-md border border-gray-100"
      }`}>
        <div className="flex items-center gap-1.5 mb-1">
          {message.role === "assistant" ? (
            <FaRobot className="text-blue-500" size={14} />
          ) : (
            <FiUser className="text-blue-200" size={14} />
          )}
          <span className="text-xs font-medium">
            {message.role === "assistant" ? "AI Trainer" : "You"}
          </span>
          <span className="text-xs opacity-70 ml-auto">
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderMessageContent(message.content)}
        </div>
        {message.role !== "user" && (
          <button
            onClick={() => handleCopyToClipboard(message.content)}
            className="absolute -bottom-3 right-3 bg-white text-gray-500 p-1 rounded-full shadow-md hover:text-blue-500 transition-colors"
            title="Copy to clipboard"
          >
            <FiCopy size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

// Main InterviewTrainer Component
export default function InterviewTrainer() {
  // State management
  const [userId, setUserId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumNudge, setShowPremiumNudge] = useState(false);
  const [activeMode, setActiveMode] = useState("interview");
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [problemMessages, setProblemMessages] = useState([]);
  const [activeHistory, setActiveHistory] = useState("current");
  const [pastInterviewHistories, setPastInterviewHistories] = useState([]);
  const [pastProblemHistories, setPastProblemHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [userDetails, setUserDetails] = useState({ name: "", role: "", experience: "", skills: "" });

  // Refs
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const mainRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  // Dynamic greetings
  const greetings = {
    interview: (name) => `Hey there! I’m your interviewer today, ${name || "Alex"}. Let’s kick things off easy—tell me a bit about yourself and what you’ve been up to as a ${userDetails.role || "professional"}!`,
    problem: (role) => `Hey! Ready to tackle some challenges as a ${role || "professional"}? Tell me a problem you’d like our AI to help you solve—could be anything from work to something you’re curious about!`,
  };

  // Authentication and initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        checkPremiumStatus(user.uid);
        loadCurrentHistory(user.uid, "problem");
        loadPastHistories(user.uid);
        loadUserDetails(user.uid);
      } else {
        setUserId(null);
        setInterviewMessages([{ 
          id: "1", 
          role: "assistant", 
          content: "Please log in to start your interview prep.",
          actions: [{ text: "Login", action: () => window.location.href = "/login" }]
        }]);
        setProblemMessages([{ 
          id: "1", 
          role: "assistant", 
          content: "Please log in to start solving problems.",
          actions: [{ text: "Login", action: () => window.location.href = "/login" }]
        }]);
        toast.error("Please log in to start.");
        event({ action: "login_prompt", category: "InterviewTrainer", label: "Unauthenticated Access" });
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll management
  useEffect(() => {
    if (isLoading || interviewMessages.length > 0 || problemMessages.length > 0) {
      scrollToBottom();
    }
  }, [interviewMessages, problemMessages, isLoading]);

  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current && mainRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = mainRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        if (isAtBottom || scrollHeight > prevScrollHeightRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        prevScrollHeightRef.current = scrollHeight;
      }
    }, 50);
  }, []);

  // Premium status check
  const checkPremiumStatus = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      const premiumStatus = userDoc.exists() && userDoc.data().plan === "premium";
      setIsPremium(premiumStatus);
      if (premiumStatus) setBadges(["Premium Member"]);
    } catch (error) {
      console.error("Error checking premium status:", error);
      setIsPremium(false);
    }
  };

  // Load current history
  const loadCurrentHistory = async (uid, mode) => {
    if (!uid || mode !== "problem") return;

    try {
      const historyRef = collection(db, "users", uid, "problemHistory");
      const q = query(historyRef, orderBy("timestamp", "asc"));
      
      // Check if the collection is empty and set initial greeting if needed
      const historySnapshot = await getDocs(q);
      
      if (historySnapshot.empty && problemMessages.length === 0) {
        const initialGreeting = { id: "1", role: "assistant", content: greetings.problem(userDetails.role || "professional"), timestamp: Date.now() };
        setProblemMessages([initialGreeting]);
        await setDoc(doc(historyRef), initialGreeting);
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          role: doc.data().role,
          content: doc.data().content,
          timestamp: doc.data().timestamp,
        }));
        if (activeHistory === "current") {
          setProblemMessages(historyMessages);
        }
      }, (error) => {
        console.error("Firestore snapshot error (problemHistory):", error);
        toast.error("Failed to load problem history. Try again later.");
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up problem history listener:", error);
      toast.error("Error initializing problem history.");
    }
  };

  // Load past histories
  const loadPastHistories = (uid) => {
    if (!uid) return;
    try {
      ["interviewSessions", "problemSessions"].forEach((type) => {
        const sessionsRef = collection(db, "users", uid, type);
        const q = query(sessionsRef, orderBy("timestamp", "desc"));
        onSnapshot(q, (snapshot) => {
          const histories = snapshot.docs.map((doc) => ({
            id: doc.id,
            timestamp: doc.data().timestamp,
            messages: doc.data().messages || [],
          }));
          if (type === "interviewSessions") {
            setPastInterviewHistories(histories);
          } else {
            setPastProblemHistories(histories);
          }
        });
      });
    } catch (error) {
      console.error("Error loading past histories:", error);
    }
  };

  // Load user details
  const loadUserDetails = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid, "profile", "details");
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const details = userDoc.data();
        setUserDetails(details);
        setShowForm(false);
        const initialPrompt = greetings.interview(details.name);
        setInterviewMessages([{ id: "1", role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
        await saveMessageToHistory({ id: "1", role: "assistant", content: initialPrompt, timestamp: Date.now() }, "interviewHistory");
      }
    } catch (error) {
      console.error("Error loading user details:", error);
    }
  };

  // Save message to history
  const saveMessageToHistory = async (message, collectionName) => {
    if (!userId) return;
    try {
      const messageRef = doc(collection(db, "users", userId, collectionName));
      await setDoc(messageRef, {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || Date.now(),
      });
    } catch (error) {
      console.error(`Error saving message to ${collectionName}:`, error);
      toast.error("Failed to save message.");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userDetails.name || !userDetails.role) {
      toast.error("Please fill in your name and target role.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", userId, "profile", "details");
      await setDoc(userDocRef, userDetails);
      setShowForm(false);
      const initialPrompt = greetings.interview(userDetails.name);
      setInterviewMessages([{ id: "1", role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
      await saveMessageToHistory({ id: "1", role: "assistant", content: initialPrompt, timestamp: Date.now() }, "interviewHistory");
    } catch (error) {
      console.error("Error saving user details:", error);
      toast.error("Failed to start interview. Try again!");
    }
  };

  // Handle chat submission with streaming
  const handleChatSubmit = async (inputValue) => {
    if (!userId || !inputValue.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { id: Date.now().toString(), role: "user", content: inputValue, timestamp: Date.now() };
    const assistantMessageId = Date.now().toString() + "-response";

    try {
      if (activeMode === "interview") {
        setInterviewMessages((prev) => [...prev, userMessage]);
        await saveMessageToHistory(userMessage, "interviewHistory");

        const conversationHistory = interviewMessages.map(m => `${m.role === "user" ? "You" : "Interviewer"}: ${m.content}`).join("\n");
        const fullPrompt = `Conversation so far:\n${conversationHistory}\n\nInterviewer: As a hiring manager interviewing a ${userDetails.role || "candidate"} with ${userDetails.experience || 0} years of experience and skills in ${userDetails.skills || "various areas"}, ask a thoughtful, relevant follow-up question based on the candidate's last response: "${inputValue}". Keep the tone professional yet conversational, and avoid repeating previous questions.`;
        const payload = { userId, prompt: fullPrompt };
        console.log("Sending interview payload:", payload);

        const response = await fetch("/api/interview-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get response from AI");
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        setInterviewMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: assistantContent, timestamp: Date.now() }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream complete, final content:", assistantContent);
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setInterviewMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg
            )
          );
          scrollToBottom();
        }

        await saveMessageToHistory({ id: assistantMessageId, role: "assistant", content: assistantContent, timestamp: Date.now() }, "interviewHistory");
      } else {
        setProblemMessages((prev) => [...prev, userMessage]);
        await saveMessageToHistory(userMessage, "problemHistory");

        const isInitialProblem = problemMessages.length === 1;
        const conversationHistory = problemMessages.map(m => `${m.role === "user" ? "You" : "AI Assistant"}: ${m.content}`).join("\n");
        const fullPrompt = isInitialProblem
          ? `As a helpful assistant for ${userDetails.role || "professionals"}, provide a clear, step-by-step solution to: "${inputValue}". For math or science questions, use LaTeX for equations (e.g., \\int x^2 dx), break steps into numbered lines with newlines for clarity, and keep explanations concise yet engaging. End with "Want me to dive deeper into this?"`
          : `Conversation so far:\n${conversationHistory}\n\nContinue the explanation for: "${inputValue}". For math or science, use LaTeX for equations, number steps clearly with newlines, and keep it concise and engaging. End with "How about we explore another aspect?" or "Anything else you’d like to dig into?"`;
        const payload = { userId, prompt: fullPrompt };
        console.log("Sending problem payload:", payload);

        const response = await fetch("/api/solve-problem-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get response from AI");
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        setProblemMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: assistantContent, timestamp: Date.now() }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream complete, final content:", assistantContent);
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setProblemMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg
            )
          );
          scrollToBottom();
        }

        await saveMessageToHistory({ id: assistantMessageId, role: "assistant", content: assistantContent, timestamp: Date.now() }, "problemHistory");
      }
    } catch (error) {
      console.error(`Error in ${activeMode} chat submit:`, error);
      toast.error(`Oops, something went wrong: ${error.message}`);
      if (activeMode === "interview") {
        setInterviewMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Sorry, I hit a snag. Let’s try that again!" }]);
      } else {
        setProblemMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Sorry, I hit a snag. Let’s try that again!" }]);
      }
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // Restart session
  const handleRestartSession = () => {
    if (activeMode === "interview") {
      const initialPrompt = greetings.interview(userDetails.name || "Candidate");
      setInterviewMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
      saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "interviewHistory");
    } else {
      const initialPrompt = greetings.problem(userDetails.role || "professional");
      setProblemMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
      saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "problemHistory");
    }
    setShowPremiumNudge(false);
    event({
      action: "session_restart",
      category: "InterviewTrainer",
      label: "User Restarted Session",
      value: userId,
    });
    scrollToBottom();
  };

  // Switch between modes
  const switchMode = (mode) => {
    setActiveMode(mode);
    setActiveHistory("current");
    if (mode === "interview" && !showForm && interviewMessages.length === 0) {
      const initialPrompt = greetings.interview(userDetails.name || "Candidate");
      setInterviewMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
      saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "interviewHistory");
    } else if (mode === "problem" && problemMessages.length === 0) {
      const initialPrompt = greetings.problem(userDetails.role || "professional");
      setProblemMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
      saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "problemHistory");
    }
    setShowPremiumNudge(false);
    event({
      action: "mode_switch",
      category: "InterviewTrainer",
      label: `Switched to ${mode}`,
      value: userId,
    });
    scrollToBottom();
  };

  // Switch history
  const switchHistory = (historyId) => {
    const pastHistories = activeMode === "interview" ? pastInterviewHistories : pastProblemHistories;
    const selectedHistory = pastHistories.find((h) => h.id === historyId);
    if (selectedHistory) {
      if (activeMode === "interview") {
        setInterviewMessages(selectedHistory.messages);
      } else {
        setProblemMessages(selectedHistory.messages);
      }
      setActiveHistory(historyId);
    } else {
      setActiveHistory("current");
      if (activeMode === "interview" && interviewMessages.length === 0) {
        const initialPrompt = greetings.interview(userDetails.name || "Candidate");
        setInterviewMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
        saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "interviewHistory");
      } else if (activeMode === "problem" && problemMessages.length === 0) {
        const initialPrompt = greetings.problem(userDetails.role || "professional");
        setProblemMessages([{ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }]);
        saveMessageToHistory({ id: Date.now().toString(), role: "assistant", content: initialPrompt, timestamp: Date.now() }, "problemHistory");
      }
    }
    setShowHistoryDropdown(false);
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Profile Setup Modal */}
      {showForm && activeMode === "interview" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-pop-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">👋 Welcome to AI Trainer</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <input
                  type="text"
                  value={userDetails.role}
                  onChange={(e) => setUserDetails({ ...userDetails, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="number"
                    value={userDetails.experience}
                    onChange={(e) => setUserDetails({ ...userDetails, experience: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    value={userDetails.skills}
                    onChange={(e) => setUserDetails({ ...userDetails, skills: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, Python"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Start Practicing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Premium Nudge Modal */}
      {showPremiumNudge && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-pop-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <FiStar className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unlock Premium Features</h3>
              <p className="text-sm text-gray-500 mb-6">
                Upgrade to get unlimited practice sessions, detailed feedback, and priority support.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = "/pricing"}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
                >
                  Upgrade Now - 20% Off
                </button>
                <button
                  onClick={() => setShowPremiumNudge(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Continue with Free Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-2 px-3 sticky top-0 z-20">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AI Interview Trainer
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiBookOpen size={14} />
                <span className="hidden sm:inline">History</span>
                {showHistoryDropdown ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              </button>
              {showHistoryDropdown && (
                <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1">
                  <button
                    onClick={() => switchHistory("current")}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    <FiClock size={14} /> Current Session
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="px-3 py-1 text-xs text-gray-500 font-medium">Past Sessions</div>
                  {(activeMode === "interview" ? pastInterviewHistories : pastProblemHistories).map(history => (
                    <button
                      key={history.id}
                      onClick={() => switchHistory(history.id)}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <FiClock size={14} />
                      {new Date(history.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {badges.map(badge => (
              <span key={badge} className="hidden sm:flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                <FiAward size={12} /> {badge}
              </span>
            ))}
            <button
              onClick={handleRestartSession}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Restart session"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex flex-col w-56 border-r border-gray-200 bg-white">
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-800 text-sm">Practice Modes</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={() => switchMode("interview")}
              className={`w-full flex items-center gap-2 p-2.5 rounded-lg mb-1.5 transition-colors text-sm ${
                activeMode === "interview" 
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className={`p-1.5 rounded-md ${
                activeMode === "interview" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              }`}>
                <FiUser size={16} />
              </div>
              <span>Interview Practice</span>
            </button>
            <button
              onClick={() => switchMode("problem")}
              className={`w-full flex items-center gap-2 p-2.5 rounded-lg mb-1.5 transition-colors text-sm ${
                activeMode === "problem" 
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className={`p-1.5 rounded-md ${
                activeMode === "problem" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              }`}>
                <FaRobot size={16} />
              </div>
              <span>Problem Solving</span>
            </button>
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-medium text-blue-800 mb-1.5 text-xs">Pro Tips</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                {activeMode === "interview" 
                  ? "Use STAR method (Situation, Task, Action, Result) for structured answers."
                  : "Break problems into steps and explain your reasoning clearly."}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={mainRef} className="flex-1 overflow-y-auto p-3">
          <div className="max-w-3xl mx-auto space-y-3 pb-20">
            {(activeMode === "interview" ? interviewMessages : problemMessages).map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-3 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          {/* Mode Selector - Mobile */}
          <div className="flex gap-1.5 mb-2 md:hidden overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => switchMode("interview")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                activeMode === "interview"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => switchMode("problem")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                activeMode === "problem"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Problem Solving
            </button>
          </div>
          {/* Input Form */}
          <InputForm 
            userId={userId}
            activeMode={activeMode}
            userDetails={userDetails}
            isLoading={isLoading}
            onSubmit={handleChatSubmit}
          />
        </div>
      </footer>
    </div>
  );
}