"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Copy, ThumbsUp, ThumbsDown, RotateCcw, MessageSquare, Plus, Menu, ChevronLeft, Search, Briefcase, FileText, Target, TrendingUp, Clock } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { db } from "../lib/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// Component to render message content with LaTeX and Markdown
function MessageContentRenderer({ content, isUser, onCopy }) {
  const renderContent = () => {
    const parts = [];
    let lastIndex = 0;
    
    const latexRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const matches = [...content.matchAll(latexRegex)];
    
    if (matches.length === 0) {
      return (
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              
              if (!inline && match) {
                return (
                  <div className="relative group/code my-3 overflow-x-auto bg-gray-900 rounded-lg">
                    <button
                      onClick={() => onCopy(codeString)}
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      wrapLongLines={true}
                      className="!text-xs sm:!text-sm !bg-gray-900"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              
              return (
                <code className={`${className} bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono`} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }
    
    matches.forEach((match, i) => {
      const matchText = match[0];
      const matchIndex = match.index;
      
      if (matchIndex > lastIndex) {
        const markdownPart = content.slice(lastIndex, matchIndex);
        parts.push(
          <ReactMarkdown
            key={`md-${i}`}
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                
                if (!inline && match) {
                  return (
                    <div className="relative group/code my-3 overflow-x-auto bg-gray-900 rounded-lg">
                      <button
                        onClick={() => onCopy(codeString)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        wrapLongLines={true}
                        className="!text-xs sm:!text-sm !bg-gray-900"
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                
                return (
                  <code className={`${className} bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono`} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {markdownPart}
          </ReactMarkdown>
        );
      }
      
      if (matchText.startsWith('\\[') && matchText.endsWith('\\]')) {
        const math = matchText.slice(2, -2);
        parts.push(
          <div key={`block-${i}`} className="my-4 overflow-x-auto">
            <BlockMath math={math} />
          </div>
        );
      } else if (matchText.startsWith('\\(') && matchText.endsWith('\\)')) {
        const math = matchText.slice(2, -2);
        parts.push(
          <span key={`inline-${i}`} className="inline-block mx-1">
            <InlineMath math={math} />
          </span>
        );
      }
      
      lastIndex = matchIndex + matchText.length;
    });
    
    if (lastIndex < content.length) {
      const markdownPart = content.slice(lastIndex);
      parts.push(
        <ReactMarkdown
          key="md-end"
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              
              if (!inline && match) {
                return (
                  <div className="relative group/code my-3 overflow-x-auto bg-gray-900 rounded-lg">
                    <button
                      onClick={() => onCopy(codeString)}
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      wrapLongLines={true}
                      className="!text-xs sm:!text-sm !bg-gray-900"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              
              return (
                <code className={`${className} bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono`} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {markdownPart}
        </ReactMarkdown>
      );
    }
    
    return <div>{parts}</div>;
  };
  
  return renderContent();
}

// Message Bubble Component
function MessageBubble({ message, onCopy }) {
  const isUser = message.role === "user";
  const [showActions, setShowActions] = useState(false);
  const isStreaming = message.isStreaming;

  return (
    <div
      className={`group mb-6 ${isUser ? "flex justify-end" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-full ${isUser ? "max-w-[85%]" : ""}`}>
        {/* User/AI Label */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isStreaming 
                ? "bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" 
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              ExpertResume AI
              {isStreaming && <span className="ml-2 text-xs text-blue-600">typing...</span>}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-800"
          }`}
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          <div className={`prose prose-sm sm:prose-base max-w-none ${isUser ? 'prose-invert' : ''} break-words`}
            style={{ 
              fontFamily: 'inherit',
              fontSize: '0.9375rem',
              lineHeight: '1.6'
            }}
          >
            <MessageContentRenderer content={message.content} isUser={isUser} onCopy={onCopy} />
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-blue-600 ml-1 animate-pulse"></span>
            )}
          </div>

          {/* Sources (Perplexity-style) */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 border border-gray-200 transition-colors"
                  >
                    <span className="font-medium">{idx + 1}</span>
                    <span className="max-w-[150px] truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isUser && showActions && (
          <div className="flex items-center gap-2 mt-2 ml-9">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Bad response"
            >
              <ThumbsDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{title}</h3>
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

// Conversation Item Component
function ConversationItem({ conversation, isActive, onClick, onDelete }) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive ? "bg-gray-100" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{conversation.title}</p>
        <p className="text-xs text-gray-500">{conversation.messageCount} messages</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
      >
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </div>
  );
}

export default function ExpertResumeGPT({ isOpen, onClose, isPremium }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Get user ID from auth
  useEffect(() => {
    const getUserId = async () => {
      const { auth } = await import("../lib/firebase");
      const { onAuthStateChanged } = await import("firebase/auth");
      
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
        }
      });
    };
    
    getUserId();
  }, []);

  // Load conversations
  useEffect(() => {
    if (!userId || !isOpen) return;

    const loadConversations = async () => {
      try {
        const conversationsRef = collection(db, `users/${userId}/conversationHistory`);
        const q = query(conversationsRef, orderBy("updatedAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        
        const loadedConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setConversations(loadedConversations);
        
        // If no current conversation, create a new one
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
  }, [userId, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const createNewConversation = async () => {
    if (!userId) return;

    try {
      const conversationsRef = collection(db, `users/${userId}/conversationHistory`);
      const newConversation = {
        title: "New Conversation",
        messages: [],
        messageCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(conversationsRef, newConversation);
      
      setCurrentConversationId(docRef.id);
      setMessages([]);
      setConversations(prev => [{
        id: docRef.id,
        ...newConversation,
        createdAt: new Date(),
        updatedAt: new Date()
      }, ...prev]);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadConversation = async (conversationId) => {
    if (!userId) return;

    try {
      const conversationRef = doc(db, `users/${userId}/conversationHistory`, conversationId);
      const conversationDoc = await getDocs(query(collection(db, `users/${userId}/conversationHistory`)));
      const conversation = conversationDoc.docs.find(d => d.id === conversationId);
      
      if (conversation) {
        const data = conversation.data();
        setMessages(data.messages || []);
        setCurrentConversationId(conversationId);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const saveConversation = async (updatedMessages) => {
    if (!userId || !currentConversationId) return;

    try {
      const conversationRef = doc(db, `users/${userId}/conversationHistory`, currentConversationId);
      
      // Generate title from first user message if still "New Conversation"
      const currentConv = conversations.find(c => c.id === currentConversationId);
      let title = currentConv?.title || "New Conversation";
      
      if (title === "New Conversation" && updatedMessages.length > 0) {
        const firstUserMessage = updatedMessages.find(m => m.role === "user");
        if (firstUserMessage) {
          title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
        }
      }
      
      await updateDoc(conversationRef, {
        messages: updatedMessages,
        messageCount: updatedMessages.length,
        title: title,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setConversations(prev => prev.map(c => 
        c.id === currentConversationId 
          ? { ...c, title, messageCount: updatedMessages.length, updatedAt: new Date() }
          : c
      ));
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!userId) return;

    try {
      const conversationRef = doc(db, `users/${userId}/conversationHistory`, conversationId);
      await deleteDoc(conversationRef);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          createNewConversation();
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;
    if (!isPremium) {
      alert("ExpertResume GPT is a premium feature. Please upgrade to continue.");
      return;
    }

    const userMessage = { role: "user", content: messageText.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Add a placeholder message for progressive rendering
    const placeholderMessage = {
      role: "assistant",
      content: "",
      sources: [],
      isStreaming: true
    };
    setMessages([...updatedMessages, placeholderMessage]);

    console.log("📤 Sending request with userId:", userId);

    try {
      const response = await fetch("/api/expertresume-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      console.log("Full API response:", data);
      
      // Update user context if provided
      if (data.userContext) {
        console.log("✅ User context received:", data.userContext);
        console.log("Has resumes:", data.userContext.hasResumes);
        console.log("Upload count:", data.userContext.uploadCount);
        console.log("Should show banner:", (data.userContext.hasResumes || data.userContext.uploadCount > 0));
        setUserContext(data.userContext);
      } else {
        console.log("❌ No user context in response");
      }
      
      // Progressive rendering - word by word
      const fullResponse = data.response;
      const words = fullResponse.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        
        setMessages([...updatedMessages, {
          role: "assistant",
          content: currentText,
          sources: i === words.length - 1 ? (data.sources || []) : [],
          isStreaming: i < words.length - 1
        }]);
        
        // Delay between words for progressive effect
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // Final message with all sources
      const finalMessage = {
        role: "assistant",
        content: fullResponse,
        sources: data.sources || [],
        isStreaming: false
      };
      
      const finalMessages = [...updatedMessages, finalMessage];
      setMessages(finalMessages);
      
      // Save to Firestore
      await saveConversation(finalMessages);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isStreaming: false
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    createNewConversation();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    handleSend(prompt);
  };

  const suggestedPrompts = [
    {
      icon: Briefcase,
      title: "Resume Review",
      description: "Get expert feedback on your resume structure, content, and ATS optimization",
      prompt: "Can you review my resume and provide detailed feedback on how to improve it?"
    },
    {
      icon: FileText,
      title: "Cover Letter Help",
      description: "Craft compelling cover letters tailored to specific job applications",
      prompt: "Help me write a compelling cover letter for a software engineer position"
    },
    {
      icon: Target,
      title: "Career Strategy",
      description: "Develop a personalized career roadmap and job search strategy",
      prompt: "What's the best career strategy for transitioning into data science?"
    },
    {
      icon: TrendingUp,
      title: "Interview Prep",
      description: "Practice common interview questions and get expert coaching",
      prompt: "Help me prepare for a technical interview at a top tech company"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
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

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
            
            <div className="overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 140px)" }}>
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
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">ExpertResume AI</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Your AI Career Coach</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="New conversation"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="space-y-8">
                {/* Welcome Message */}
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" 
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Welcome to ExpertResume AI
                  </h2>
                  <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Your personal AI career coach. Ask me anything about resumes, interviews, career growth, or job search strategies.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggested topics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedPrompts.map((prompt, idx) => (
                      <SuggestionCard
                        key={idx}
                        icon={prompt.icon}
                        title={prompt.title}
                        description={prompt.description}
                        onClick={() => handleSuggestionClick(prompt.prompt)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Contextual Info Banner - Shows in conversation */}
                {userContext && (userContext.hasResumes || userContext.uploadCount > 0) && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg sticky top-0 z-10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-800 font-medium">
                          🎯 Personalized AI Coach Active
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          I have access to 
                          {userContext.hasResumes && (
                            <> your {userContext.resumeCount} resume{userContext.resumeCount > 1 ? 's' : ''}
                            {userContext.latestResumeJobTitle && ` (${userContext.latestResumeJobTitle})`}</>
                          )}
                          {userContext.hasResumes && userContext.uploadCount > 0 && ' and '}
                          {userContext.uploadCount > 0 && (
                            <>{userContext.uploadCount} uploaded resume{userContext.uploadCount > 1 ? 's' : ''}</>
                          )}
                          {userContext.latestAtsScore && ` (Latest ATS: ${userContext.latestAtsScore}/100)`}.
                          {' '}Ask me anything about your career!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    onCopy={handleCopy}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-5 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
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
                  placeholder="Ask me anything about your career..."
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 text-[15px] text-gray-900 placeholder-gray-400 font-normal shadow-sm hover:border-gray-400 transition-colors"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <p className="text-[11px] text-gray-400 font-normal">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-600">Enter</kbd> to send
              </p>
              <span className="text-gray-300">•</span>
              <p className="text-[11px] text-gray-400 font-normal">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-600">Shift + Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
