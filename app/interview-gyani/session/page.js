"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Loader2, CheckCircle2, AlertCircle, ArrowRight, RefreshCcw, User, Bot, Target, TrendingUp, ShieldCheck, Mic, MicOff, Lightbulb, Sparkles, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export default function InterviewSession() {
    const { user, loading, isInterviewPremium } = useAuth();
    const router = useRouter();
    const [setup, setSetup] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, idle, answering, evaluating, limited
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [history, setHistory] = useState([]); // [{type: 'question', content: ''}, {type: 'answer', content: ''}]
    const [questionCount, setQuestionCount] = useState(0);
    const [sessionId] = useState(() => (typeof window !== 'undefined' ? (sessionStorage.getItem('current_session_id') || uuidv4()) : ''));
    const scrollRef = useRef(null);

    // New states for enhanced features
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [answerGuidance, setAnswerGuidance] = useState(null);
    const [showGuidance, setShowGuidance] = useState(true);
    const [answerTips, setAnswerTips] = useState([]);
    const [wordCount, setWordCount] = useState(0);
    const guidanceTimeoutRef = useRef(null);
    const [useBackendSpeech, setUseBackendSpeech] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && sessionId) {
            sessionStorage.setItem('current_session_id', sessionId);
        }
    }, [sessionId]);

    useEffect(() => {
        if (loading) return;

        if (!isInterviewPremium) {
            router.push('/interview-gyani');
            return;
        }

        const savedSetup = sessionStorage.getItem('interview_setup');
        if (!savedSetup) {
            router.push('/interview-gyani/setup');
            return;
        }

        const parsedSetup = JSON.parse(savedSetup);
        setSetup(parsedSetup);

        if (status === 'loading') {
            startInterview(parsedSetup);
        }
    }, [user, loading, isInterviewPremium]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [history, status]);

    // Keyboard shortcuts for voice recording
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Space or Cmd+Space to toggle recording
            if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
                e.preventDefault();
                if (status === 'idle' && recognition) {
                    if (isRecording) {
                        stopRecording();
                    } else {
                        startRecording();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, recognition, status]);

    // Helper function to clean transcribed text (remove filler words, fix common issues)
    const cleanTranscription = (text) => {
        if (!text) return '';
        
        // Remove common filler words and sounds
        const fillerWords = [
            /\b(ahh|uhh|umm|uhm|ah|uh|er|um|eh|oh)\b/gi,
            /\b(like|you know|I mean|sort of|kind of)\b/gi,
            /\b(actually|basically|literally)\b/gi,
        ];
        
        let cleaned = text;
        fillerWords.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        
        // Fix common US accent misinterpretations
        const accentFixes = {
            'the': 'the',
            'da': 'the',
            'dis': 'this',
            'dat': 'that',
            'wat': 'what',
            'wud': 'would',
            'wudnt': "wouldn't",
            'cud': 'could',
            'shud': 'should',
            'hav': 'have',
            'havnt': "haven't",
            'dont': "don't",
            'wont': "won't",
            'cant': "can't",
            'isnt': "isn't",
            'wasnt': "wasn't",
            'werent': "weren't",
        };
        
        Object.keys(accentFixes).forEach(wrong => {
            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            cleaned = cleaned.replace(regex, accentFixes[wrong]);
        });
        
        // Remove extra spaces and clean up
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Capitalize first letter if needed
        if (cleaned.length > 0 && cleaned[0] !== cleaned[0].toUpperCase()) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        
        return cleaned;
    };

    // Initialize voice recognition with US English support
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            // Configure for US English
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-IN'; // US English
            recognitionInstance.maxAlternatives = 3; // Get multiple alternatives for better accuracy
            
            // Increase sensitivity for better detection
            if (recognitionInstance.serviceURI) {
                recognitionInstance.serviceURI = undefined; // Use default service
            }

            recognitionInstance.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;
                    const confidence = result[0].confidence || 0;
                    
                    // Use alternative if confidence is low (common with accents)
                    let bestTranscript = transcript;
                    if (confidence < 0.7 && result.length > 1) {
                        // Try alternatives for better accuracy
                        for (let j = 1; j < result.length; j++) {
                            if (result[j].confidence > confidence) {
                                bestTranscript = result[j].transcript;
                                break;
                            }
                        }
                    }
                    
                    if (result.isFinal) {
                        const cleaned = cleanTranscription(bestTranscript);
                        if (cleaned) {
                            finalTranscript += cleaned + ' ';
                        }
                    } else {
                        interimTranscript += bestTranscript;
                    }
                }

                if (finalTranscript) {
                    setAnswer(prev => {
                        const cleaned = cleanTranscription(finalTranscript);
                        return prev + (prev && !prev.endsWith(' ') ? ' ' : '') + cleaned;
                    });
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // Don't show error for no-speech, just silently continue
                    return;
                } else if (event.error === 'audio-capture') {
                    toast.error('Microphone not found. Please check your microphone settings.');
                } else if (event.error === 'not-allowed') {
                    toast.error('Microphone permission denied. Please allow microphone access.');
                } else if (event.error === 'network') {
                    toast.error('Network error. Please check your connection.');
                } else {
                    console.warn('Speech recognition warning:', event.error);
                }
                setIsRecording(false);
            };

            recognitionInstance.onend = () => {
                if (isRecording) {
                    // Restart if still recording (with small delay to avoid errors)
                    setTimeout(() => {
                        try {
                            recognitionInstance.start();
                        } catch (e) {
                            console.warn('Failed to restart recognition:', e);
                            setIsRecording(false);
                        }
                    }, 100);
                }
            };

            recognitionInstance.onstart = () => {
                console.log('Speech recognition started');
            };

            setRecognition(recognitionInstance);

            return () => {
                if (recognitionInstance) {
                    try {
                        recognitionInstance.stop();
                    } catch (e) {
                        console.warn('Error stopping recognition:', e);
                    }
                }
            };
        }
    }, []);

    // Real-time answer guidance
    useEffect(() => {
        if (status === 'idle' && currentQuestion && answer.length > 10) {
            // Clear previous timeout
            if (guidanceTimeoutRef.current) {
                clearTimeout(guidanceTimeoutRef.current);
            }

            // Debounce guidance generation
            guidanceTimeoutRef.current = setTimeout(async () => {
                try {
                    const res = await fetch('/api/interview-gyani', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'get_answer_guidance',
                            question: currentQuestion,
                            answer: answer,
                            jobRole: setup?.jobRole,
                            experienceLevel: setup?.experienceLevel,
                            userId: user?.uid || `guest_${sessionId}`,
                            sessionId: sessionId
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setAnswerGuidance(data);
                        setAnswerTips(data.tips || []);
                    }
                } catch (err) {
                    console.error('Guidance generation failed:', err);
                }
            }, 1500); // Wait 1.5s after user stops typing
        } else {
            setAnswerGuidance(null);
            setAnswerTips([]);
        }

        // Update word count
        setWordCount(answer.trim().split(/\s+/).filter(word => word.length > 0).length);

        return () => {
            if (guidanceTimeoutRef.current) {
                clearTimeout(guidanceTimeoutRef.current);
            }
        };
    }, [answer, currentQuestion, status, setup]);

    // Voice recording handlers with better error handling
    const startRecording = () => {
        if (!recognition) {
            toast.error('Voice input not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        try {
            // Stop any existing recording first
            if (isRecording) {
                recognition.stop();
                setTimeout(() => {
                    recognition.start();
                }, 200);
            } else {
                recognition.start();
            }
            setIsRecording(true);
            toast.success('🎤 Recording started. Speak clearly...', { duration: 2000 });
        } catch (err) {
            console.error('Failed to start recording:', err);
            if (err.message && err.message.includes('already started')) {
                // Already recording, ignore
                return;
            }
            toast.error('Failed to start recording. Please try again.');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (recognition && isRecording) {
            try {
                recognition.stop();
                setIsRecording(false);
                toast.success('Recording stopped', { duration: 1500 });
            } catch (err) {
                console.error('Error stopping recording:', err);
                setIsRecording(false);
            }
        }
    };

    const startInterview = async (setupData) => {
        // Continue even if user is null (guest mode)
        setStatus('generating');
        try {
            const res = await fetch('/api/interview-gyani', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_question',
                    ...setupData,
                    userId: user?.uid || `guest_${sessionId}`,
                    sessionId: sessionId
                })
            });

            if (res.status === 429) {
                setStatus('limited');
                return;
            }

            const data = await res.json();
            setCurrentQuestion(data.question);
            setHistory([{ role: 'bot', content: data.question }]);
            setStatus('idle');
            setQuestionCount(1);
        } catch (err) {
            toast.error("Failed to start interview. Please try again.");
            setStatus('idle');
        }
    };

    const handleNextQuestion = async () => {
        setStatus('generating');
        setFeedback(null);
        setAnswer("");
        setAnswerGuidance(null);
        setAnswerTips([]);
        setWordCount(0);
        if (isRecording) {
            stopRecording();
        }

        try {
            const res = await fetch('/api/interview-gyani', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_question',
                    ...setup,
                    history: history,
                    userId: user?.uid || `guest_${sessionId}`,
                    sessionId: sessionId
                })
            });

            if (res.status === 429) {
                setStatus('limited');
                return;
            }

            const data = await res.json();
            setCurrentQuestion(data.question);
            setHistory(prev => [...prev, { role: 'bot', content: data.question }]);
            setQuestionCount(prev => prev + 1);
            setStatus('idle');
        } catch (err) {
            toast.error("Error generating next question.");
            setStatus('idle');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;

        // Prevent submission if already evaluating
        if (status === 'evaluating') return;

        const userMsg = { role: 'user', content: answer };
        setHistory(prev => [...prev, userMsg]);
        setStatus('evaluating');

        try {
            const res = await fetch('/api/interview-gyani', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'evaluate_answer',
                    ...setup,
                    question: currentQuestion,
                    answer: answer,
                    userId: user?.uid || `guest_${sessionId}`,
                    sessionId: sessionId
                })
            });

            if (res.status === 429) {
                setStatus('limited');
                return;
            }

            const data = await res.json();
            setFeedback(data);
            setStatus('feedback');
        } catch (err) {
            toast.error("Analysis failed. Try again.");
            setStatus('idle');
        }
    };

    const handleFinish = () => {
        sessionStorage.setItem('full_session', JSON.stringify(history));
        router.push('/interview-gyani/report');
    };

    if (status === 'loading' || !setup) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Preparing your interviewer...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white flex flex-col text-slate-900 overflow-hidden">
            {/* Header - Mobile Optimized */}
            <header className="bg-white relative z-[100] py-2.5 sm:py-3 px-3 sm:px-6 flex items-center justify-between shrink-0 border-b border-slate-100 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">IG</div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 leading-tight truncate">Mock Session</h1>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-black tracking-[0.1em] truncate">{setup?.jobRole}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                    </div>
                    <div className="sm:hidden w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <button
                        onClick={handleFinish}
                        className="text-[9px] sm:text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.1em] px-2 py-1 sm:px-0 sm:py-0"
                    >
                        <span className="hidden sm:inline">End Session</span>
                        <span className="sm:hidden">End</span>
                    </button>
                </div>
            </header>

            {/* Chat Area - Mobile Optimized */}
            <main className="flex-1 overflow-y-auto pb-24 sm:pb-32 scroll-smooth mt-0 min-h-0">
                <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 space-y-6 sm:space-y-12">
                    <AnimatePresence mode="popLayout">
                        {history.map((msg, i) => (
                            <motion.div
                                key={`msg-${i}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className={`flex gap-2 sm:gap-4 md:gap-6 ${msg.role === 'user' ? 'justify-end' : ''}`}
                            >
                                {msg.role === 'bot' && (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                                    </div>
                                )}
                                <div className={`flex flex-col gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                    <div className={`px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm border leading-relaxed text-sm sm:text-[15px] font-medium transition-all duration-300 ${msg.role === 'bot'
                                        ? 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none'
                                        : 'bg-slate-900 text-white border-slate-900 rounded-tr-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'bot' && i === history.length - 1 && status === 'idle' && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[9px] sm:text-[10px] font-bold text-slate-300 ml-2 sm:ml-4 italic"
                                        >
                                            Interviewer is listening...
                                        </motion.span>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Real-time Answer Guidance */}
                        {status === 'idle' && answer.length > 10 && answerGuidance && showGuidance && (
                            <motion.div
                                key="answer-guidance"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg"
                            >
                                <div className="flex items-start justify-between mb-2 sm:mb-3">
                                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                                        <h4 className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-wide truncate">Real-time Guidance</h4>
                                    </div>
                                    <button
                                        onClick={() => setShowGuidance(false)}
                                        className="text-blue-400 hover:text-blue-600 transition-colors shrink-0 p-1"
                                        aria-label="Close guidance"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {answerGuidance.suggestion && (
                                    <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2 sm:mb-3 leading-relaxed">{answerGuidance.suggestion}</p>
                                )}
                                {answerTips.length > 0 && (
                                    <div className="space-y-1.5 sm:space-y-2">
                                        {answerTips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs text-blue-700">
                                                <Sparkles className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Feedback Card - Enhanced with persistent display */}
                        {feedback && (
                            <motion.div
                                key="feedback-card"
                                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, ease: "backOut" }}
                                className="bg-white border-2 border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative z-10"
                            >
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                        </div>
                                        <span className="text-slate-900 font-black uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px] truncate">AI Session Analysis</span>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">SCORE</div>
                                        <div className="text-xl sm:text-2xl font-black text-blue-600 italic tracking-tighter">
                                            {feedback.score}<span className="text-slate-300 text-[10px] sm:text-xs not-italic">/100</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-10">
                                        <div>
                                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">You Nailed This</h4>
                                            <div className="space-y-2 sm:space-y-3">
                                                {feedback?.strengths?.map((s, i) => (
                                                    <div key={i} className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                                                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                                                        <span>{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Critical Gaps</h4>
                                            <div className="space-y-2 sm:space-y-3">
                                                {feedback?.weaknesses?.map((w, i) => (
                                                    <div key={i} className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                                                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        <span>{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Improved Sample Answer */}
                                    {feedback?.improvedSampleAnswer && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5">
                                            <h4 className="text-[9px] sm:text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                                                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                                <span>How to Improve Your Answer</span>
                                            </h4>
                                            <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed mb-3 sm:mb-4">{feedback.improvedSampleAnswer}</p>
                                            {feedback?.actionableSteps && feedback.actionableSteps.length > 0 && (
                                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-amber-300">
                                                    <h5 className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1.5 sm:mb-2">Action Steps:</h5>
                                                    <ul className="space-y-1.5 sm:space-y-2">
                                                        {feedback.actionableSteps.map((step, i) => (
                                                            <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs text-amber-900 leading-relaxed">
                                                                <span className="text-amber-600 font-bold shrink-0">•</span>
                                                                <span>{step}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="bg-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6">
                                        <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                                            <h4 className="text-[9px] sm:text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Interviewer's Advice</h4>
                                            <p className="text-xs sm:text-sm font-bold leading-relaxed">{feedback?.advice}</p>
                                        </div>
                                        <button
                                            onClick={handleNextQuestion}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-black transition-all shadow-xl shadow-slate-900/10 group active:scale-95"
                                        >
                                            Next Question
                                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Loading States */}
                        {status === 'generating' && (
                            <motion.div
                                key="generating-loader"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-2 sm:gap-4 md:gap-6"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                                </div>
                                <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-2 sm:gap-4">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest italic">Interviewer is thinking...</span>
                                </div>
                            </motion.div>
                        )}

                        {status === 'evaluating' && (
                            <motion.div
                                key="evaluating-loader"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex gap-2 sm:gap-4 md:gap-6 flex-row-reverse"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-700 flex items-center gap-2 sm:gap-4">
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-spin" />
                                    <span className="text-xs sm:text-sm font-black text-blue-100 uppercase tracking-widest italic">Analyzing response...</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Limited Access Card - Mobile Optimized */}
                        {status === 'limited' && (
                            <motion.div
                                key="limited-card"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10">
                                    <Target className="w-20 h-20 sm:w-32 sm:h-32" />
                                </div>
                                <div className="relative z-10 max-w-md mx-auto">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-8 shadow-xl shadow-blue-500/20">
                                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 uppercase tracking-tighter italic">Limit Reached</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-10 leading-relaxed font-medium px-2">
                                        {isInterviewPremium
                                            ? "This shouldn't happen! You're on a premium plan and should have unlimited access. Please refresh the page or contact support if this persists."
                                            : "You've hit the practice limit. Unlock unlimited sessions, resume-aware questions, and detailed action plans."
                                        }
                                    </p>
                                    {!isInterviewPremium && (
                                        <Link
                                            href="/checkout?billingCycle=quarterly&step=1"
                                            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 group active:scale-95"
                                        >
                                            <span className="whitespace-nowrap">Unlock Full Interview Access</span>
                                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleFinish}
                                        className="block w-full py-2 sm:py-3 text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors mt-4 sm:mt-6"
                                    >
                                        View Session Report →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={scrollRef} className="h-4" />
                </div>
            </main>

            {/* Input Area - Mobile Optimized */}
            <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    {status === 'idle' ? (
                        <div className="space-y-2 sm:space-y-3">
                            {/* Answer Structure Tips */}
                            {answer.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs text-blue-800"
                                >
                                    <div className="flex items-start gap-1.5 sm:gap-2">
                                        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold mb-1 text-xs sm:text-sm">💡 Answer Structure Tips:</p>
                                            <ul className="space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs text-blue-700">
                                                <li>• Start with a brief context or situation</li>
                                                <li>• Describe your specific actions and approach</li>
                                                <li>• Highlight the results or outcomes achieved</li>
                                                <li>• Connect back to the question asked</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="relative group transition-all duration-500">
                                <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[1.5rem] sm:rounded-[2.5rem] opacity-0 group-focus-within:opacity-20 blur-xl transition-all"></div>
                                <div className="relative bg-white border-2 border-slate-200 group-focus-within:border-slate-400 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl sm:shadow-2xl overflow-hidden transition-all duration-300">
                                    <div className="flex items-end gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4">
                                        <textarea
                                            autoFocus
                                            rows={1}
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmitAnswer();
                                                }
                                            }}
                                            placeholder="Discuss your experience or answer the question..."
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none resize-none max-h-32 sm:max-h-48 overflow-y-auto bg-transparent scrollbar-hide"
                                            style={{ minHeight: '40px' }}
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Voice Input Button */}
                                            {recognition && (
                                                <button
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-[1.2rem] flex items-center justify-center transition-all shadow-lg shrink-0 active:scale-95 ${isRecording
                                                            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                        }`}
                                                    title={isRecording ? 'Stop recording' : 'Start voice input'}
                                                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                                                >
                                                    {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSubmitAnswer}
                                                disabled={!answer.trim()}
                                                className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-900 text-white rounded-xl sm:rounded-[1.2rem] flex items-center justify-center hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-lg shrink-0 active:scale-95"
                                                aria-label="Send answer"
                                            >
                                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-3 sm:px-4 md:px-6 pb-2 sm:pb-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-0 bg-slate-50/50">
                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-widest uppercase">Progress: {questionCount} Qs</span>
                                            {wordCount > 0 && (
                                                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-widest uppercase">
                                                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                            {isRecording && (
                                                <span className="text-[8px] sm:text-[9px] font-black text-red-500 tracking-widest uppercase flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                    <span className="hidden sm:inline">Recording (en-IN)</span>
                                                    <span className="sm:hidden">Recording</span>
                                                </span>
                                            )}
                                            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-slate-400 tracking-widest uppercase opacity-50 hidden sm:inline">Enter to send • Shift+Enter for new line</span>
                                            <span className="text-[7px] sm:text-[8px] font-black text-slate-400 tracking-widest uppercase opacity-50 sm:hidden">Enter to send</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        status === 'feedback' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-4 rounded-full border border-slate-200 text-center"
                            >
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Check the evaluation above to proceed</p>
                            </motion.div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
