"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import AuthProtection from "../components/AuthProtection";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft, Send, Sparkles, User, MessageSquare, Plus, Trash2, Menu, X, File,
  Loader2, Paperclip, Briefcase, FileText, Target, TrendingUp,
  Wrench, ChevronDown, Settings, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical, Mic, Copy
} from "lucide-react";


function ConversationItem({ conversation, isActive, onClick, onDelete }) {
  const displayTitle = conversation.title || "New Conversation";

  return (
    <div
      onClick={onClick}
      className={`group px-3 py-2 rounded-full cursor-pointer transition-all flex items-center justify-between gap-2 overflow-hidden ${isActive
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
        <p className="text-sm truncate">
          {displayTitle}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-full transition-all flex-shrink-0 text-gray-400 hover:text-red-500 shadow-sm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function MessageContentRenderer({ content, isUser, onCopy }) {
  if (isUser) {
    return <p className="text-base whitespace-pre-wrap break-words">{content}</p>;
  }

  return (
    <div className="prose prose-slate max-w-none text-gray-800">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-mono lowercase">{match[1]}</span>
                  <button
                    onClick={() => onCopy(String(children))}
                    className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "#1e1e1e", // Keep code dark for contrast
                    fontSize: "0.875rem",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={`${className} bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200`} {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 text-gray-800 leading-relaxed text-base">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-2 text-gray-800">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-2 text-gray-800">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 mt-6 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-900 mt-6 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-900 mt-4 first:mt-0">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 bg-blue-50 py-3 pr-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 text-gray-700">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-gray-50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ExpertResumeChatContent() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        const conversationsRef = collection(db, `users/${user.uid}/conversationHistory`);
        const q = query(conversationsRef, orderBy("updatedAt", "desc"), limit(20));
        const snapshot = await getDocs(q);

        const loadedConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setConversations(loadedConversations);

        if (!currentConversationId && loadedConversations.length === 0) {
          createNewConversation();
        } else if (!currentConversationId && loadedConversations.length > 0) {
          loadConversation(loadedConversations[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    loadConversations();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const createNewConversation = async () => {
    if (!user?.uid) return;

    try {
      const conversationsRef = collection(db, `users/${user.uid}/conversationHistory`);
      const newConversation = {
        title: "New Conversation",
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      const newConv = { id: docRef.id, ...newConversation };
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversationId(docRef.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new conversation");
    }
  };

  const loadConversation = async (conversationId) => {
    if (!user?.uid) return;

    try {
      const conversationRef = doc(db, `users/${user.uid}/conversationHistory`, conversationId);
      const snapshot = await getDocs(query(collection(db, `users/${user.uid}/conversationHistory`)));
      const conversation = snapshot.docs.find(doc => doc.id === conversationId)?.data();

      if (conversation) {
        setMessages(conversation.messages || []);
        setCurrentConversationId(conversationId);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!user?.uid) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/conversationHistory`, conversationId));
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      if (currentConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          createNewConversation();
        }
      }

      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type, // Store MIME type
        base64: base64
      });
      toast.success(`Attached: ${file.name}`);
      // Clear value so same file can be selected again
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      window.speechRecognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      window.speechRecognition = recognition;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast.error("Voice input error. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || isLoading || isStreaming || !user?.uid) return;

    const fileToSend = selectedFile;
    const messageContent = input.trim() + (fileToSend ? `\n📎 ${fileToSend.name}` : "");

    const userMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedFile(null); // Clear file immediately
    setIsLoading(true);

    try {
      // Send all previous messages + current message to API
      const allMessages = [...messages, userMessage];

      const response = await fetch("/api/expertresume-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          userId: user.uid,
          attachment: fileToSend ? {
            name: fileToSend.name,
            type: fileToSend.type,
            content: fileToSend.base64
          } : null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      // Create placeholder message for streaming content
      const assistantMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString()
      }]);

      // Turn off loading spinner once streaming starts
      setIsLoading(false);
      setIsStreaming(true);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.type === 'chunk') {
                accumulatedContent = data.accumulated;

                // Update the message progressively
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[assistantMessageIndex] = {
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date().toISOString()
                  };
                  return newMessages;
                });
              } else if (data.type === 'complete') {
                setIsStreaming(false);
                // Final update with complete content
                const finalMessages = [...messages, userMessage, {
                  role: "assistant",
                  content: accumulatedContent,
                  timestamp: new Date().toISOString()
                }];

                setMessages(finalMessages);

                // Save to Firestore
                if (currentConversationId) {
                  const conversationRef = doc(db, `users/${user.uid}/conversationHistory`, currentConversationId);
                  await updateDoc(conversationRef, {
                    messages: finalMessages,
                    updatedAt: serverTimestamp(),
                    title: finalMessages[0]?.content?.slice(0, 50) || "New Conversation"
                  });

                  // Update local state
                  setConversations(prev =>
                    prev.map(c =>
                      c.id === currentConversationId
                        ? { ...c, title: finalMessages[0]?.content?.slice(0, 50) || "New Conversation", updatedAt: { seconds: Date.now() / 1000 } }
                        : c
                    )
                  );
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error("Error parsing chunk:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
      // Remove the placeholder message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            ExpertResume GPT is available exclusively for premium members. Upgrade now to access unlimited AI-powered career assistance!
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-300">
                Upgrade to Premium
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all duration-300">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <style jsx global>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        }
      }} />


      {/* Mobile Header Toggle - Moved to Root for visibility */}
      <div className="lg:hidden fixed top-4 left-4 z-[70]">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-[60] w-[260px] bg-gray-50/95 h-full transition-all duration-300 flex flex-col border-r border-gray-200 lg:pt-20`}>

        {/* Sidebar Top: New Chat */}
        <div className="p-4 flex flex-col gap-6">
          <button
            onClick={createNewConversation}
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-full transition-all text-sm font-medium border border-gray-200 w-fit shadow-sm"
          >
            <Plus className="w-5 h-5 text-gray-500" />
            <span className="font-semibold">New chat</span>
          </button>
        </div>

        {/* Sidebar Sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
          <div className="mb-6">
            <div className="px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider"> Career Tools </div>
            <div className="space-y-1 mb-6">
              <button
                onClick={() => toast.success("Feature coming soon!")}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all group"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Professional Headshot</span>
              </button>
              <button
                onClick={() => setInput("Review my resume")}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all group"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Resume Review</span>
              </button>
            </div>

            <div className="px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider"> Recent </div>
            <div className="space-y-1">
              {conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === currentConversationId}
                  onClick={() => loadConversation(conv.id)}
                  onDelete={deleteConversation}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full pt-16 lg:pt-20">



        {/* Close/Back Button for Immersive Mode */}
        <div className="absolute top-4 right-4 z-30">
          <Link href="/dashboard">
            <button
              className="p-2.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-100 shadow-sm rounded-full text-gray-400 hover:text-red-500 transition-all group"
              title="Close Chat"
            >
              <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>
          </Link>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-[160px]">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-blue-100/40 blur-[40px] rounded-full scale-150" />
                  <Sparkles className="w-8 h-8 text-blue-500 relative z-10" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Start a new conversation</p>
              </div>
            ) : (
              <div className="space-y-10 py-8">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex group/msg ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`${message.role === "user"
                        ? "max-w-[85%] bg-teal-600 text-white rounded-[24px] rounded-tr-sm px-6 py-3.5 shadow-md"
                        : "w-full text-gray-800"
                        }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-base whitespace-pre-wrap break-words leading-relaxed font-medium">{message.content}</p>
                      ) : (
                        <div className="flex gap-5 sm:gap-6">
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="relative">
                              <MessageContentRenderer
                                content={message.content}
                                isUser={false}
                                onCopy={handleCopy}
                              />
                            </div>

                            {/* Action Icons */}
                            {!isStreaming && (
                              <div className="flex items-center gap-1 mt-4">
                                <button
                                  onClick={() => handleCopy(message.content)}
                                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                                  title="Copy"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all">
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-6">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col gap-3 w-full pt-2">
                      <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 bg-gradient-to-t from-white/90 via-white/80 to-transparent pt-12">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 rounded-[28px] transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col">

              {/* File Preview - Inside Input Box */}
              {selectedFile && (
                <div className="px-4 pt-4 pb-1">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl w-fit animate-in fade-in slide-in-from-bottom-1">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-blue-50">
                      <File className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{selectedFile.type.split('/')[1] || 'file'}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end p-2 pl-3">

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex-shrink-0"
                  title="Add file"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                />

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 max-h-[200px] min-h-[48px] bg-transparent border-none focus:ring-0 px-3 py-2.5 text-gray-800 placeholder-gray-400 text-base resize-none custom-scrollbar"
                  rows={1}
                  disabled={isLoading || isStreaming}
                />

                <div className="flex items-center gap-1 pr-1 pb-1">
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-full transition-all ${isListening
                      ? "text-red-500 bg-red-50 animate-pulse"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    title={isListening ? "Stop listening" : "Use microphone"}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedFile) || isLoading || isStreaming}
                    className={`p-2.5 rounded-full transition-all duration-200 ${(!input.trim() && !selectedFile) || isLoading || isStreaming
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50 hover:scale-105 active:scale-95"
                      }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mt-4">
              <p className="text-center text-[11px] text-gray-400 font-medium">
                ExpertResume can give inaccurate info, so please double-check.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function ExpertResumeChatPage() {
  return (
    <AuthProtection>
      <ExpertResumeChatContent />
    </AuthProtection>
  );
}

