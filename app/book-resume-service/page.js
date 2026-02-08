"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Shield,
  Clock,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Users,
  TrendingUp,
  PhoneCall,
  Target,
  Briefcase,
  Handshake,
  FileText,
  Award,
  BadgeCheck,
  USRupee,
  CreditCard,
  Lock,
  Timer,
  Gift,
  Share2,
  X,
  Download,
  Eye,
  ThumbsUp,
  MapPin,
  Building2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Dynamic imports for heavy modals
const QuickIntakeForm = dynamic(() => import('./components/QuickIntakeForm'), { ssr: false });
const ExitIntentPopup = dynamic(() => import('./components/ExitIntentPopup'), { ssr: false });

export default function BookResumeServicePage() {
  const [currency, setCurrency] = useState('INR');
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [slotsRemaining, setSlotsRemaining] = useState(5);
  const [bookingsToday, setBookingsToday] = useState(12);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const exitIntentRef = useRef(false);
  const formDataRef = useRef({ name: '', phone: '', experience: '' });

  // Detect currency based on domain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const detectedCurrency = hostname.includes('expertresume.com') ? 'USD' : 'INR';
      setCurrency(detectedCurrency);
    }
  }, []);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentRef.current && timeOnPage > 10) {
        exitIntentRef.current = true;
        setShowExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [timeOnPage]);

  // WhatsApp contact function with enhanced templates
  const handleWhatsAppClick = (service = '', template = 'default') => {
    const phoneNumber = '918431256903';
    let message = '';

    if (template === 'quick') {
      const { name, phone, experience } = formDataRef.current;
      message = `Hi! I'm ${name || 'interested'} in your resume service.\n\nPhone: ${phone || 'Not provided'}\nExperience: ${experience || 'Not specified'}\n\n${service ? `Service: ${service}` : 'Please help me choose the right package.'}`;
    } else if (service) {
      message = `Hi! I'm interested in the ${service} service. Can you help me with my resume?`;
    } else {
      message = `Hi! I'm interested in your professional resume service. Can you help me?`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowQuickForm(false);
    setShowExitPopup(false);
  };

  const handleCallClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'tel:+918431256903';
    }
  };

  const handleQuickFormSubmit = (data) => {
    // Update ref with data from the isolated component
    formDataRef.current = data;
    handleWhatsAppClick('', 'quick');
    setShowQuickForm(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Professional Resume Writing Service',
        text: 'Get ATS-optimized resumes starting at ₹299!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Testimonials data - Including Executive Success Stories
  const testimonials = [
    {
      name: "Rajesh Mehta",
      city: "Bangalore",
      role: "VP Engineering",
      company: "MNC Tech Firm",
      rating: 5,
      text: "Transformed my CV for C-level roles. Landed ₹32L offer within 3 weeks. The executive positioning was spot-on.",
      salary: "₹18L → ₹32L",
      image: "👨‍💼",
      executive: true
    },
    {
      name: "Priya Singh",
      city: "Mumbai",
      role: "Finance Director",
      company: "Fortune 500",
      rating: 5,
      text: "The personal branding strategy helped me stand out at director level. Worth every rupee for senior professionals.",
      salary: "₹22L → ₹38L",
      image: "👩‍💼",
      executive: true
    },
    {
      name: "Ravi Kumar",
      city: "Bangalore",
      role: "Software Engineer",
      company: "TCS",
      rating: 5,
      text: "Got 3 interview calls in 2 weeks! The ATS optimization really worked.",
      salary: "₹12L",
      image: "👨‍💻"
    },
    {
      name: "Aman Sharma",
      city: "Mumbai",
      role: "Business Analyst",
      company: "Infosys",
      rating: 5,
      text: "Landed my dream job at Infosys. The resume format was perfect for US companies.",
      salary: "₹10L",
      image: "👩‍💼"
    },
    {
      name: "Amit Patel",
      city: "Delhi",
      role: "Sales Manager",
      company: "HDFC Bank",
      rating: 5,
      text: "Worth every rupee! Professional service and quick turnaround.",
      salary: "₹8L",
      image: "👨‍💼"
    },
    {
      name: "Sneha Reddy",
      city: "Hyderabad",
      role: "Data Analyst",
      company: "Wipro",
      rating: 5,
      text: "From 0 interviews to 5 calls in a month. Highly recommended!",
      salary: "₹9L",
      image: "👩‍💻"
    }
  ];

  // Industry packages
  const industryPackages = [
    {
      name: "IT/Software",
      companies: "TCS, Infosys, Wipro, HCL",
      price: currency === 'USD' ? '$50' : '₹999',
      icon: "💻"
    },
    {
      name: "Banking/Finance",
      companies: "HDFC, ICICI, SBI, Axis",
      price: currency === 'USD' ? '$55' : '₹1,199',
      icon: "🏦"
    },
    {
      name: "Manufacturing",
      companies: "L&T, Tata, Reliance",
      price: currency === 'USD' ? '$50' : '₹999',
      icon: "🏭"
    },
    {
      name: "BPO/Call Center",
      companies: "Concentrix, Teleperformance",
      price: currency === 'USD' ? '$25' : '₹499',
      icon: "📞"
    }
  ];

  const servicePackages = [
    {
      name: "Executive Impact Package",
      investment: currency === 'USD' ? '$300' : '₹19,999',
      originalPrice: currency === 'USD' ? '$500' : '₹34,999',
      savings: currency === 'USD' ? '$200' : '₹15,000',
      perDay: currency === 'USD' ? '$10' : '₹667',
      audience: "C-Suite, VPs, Directors, Senior Management (₹15L+)",
      premium: true,
      executive: true,
      badge: "EXECUTIVE",
      outcomes: [
        "C-Suite positioning & personal branding strategy",
        "Executive achievement quantification (ROI-focused)",
        "LinkedIn Executive Profile transformation",
        "Strategic narrative development for leadership roles",
        "Board-ready CV format (if needed)",
        "1-on-1 strategy consultation call",
        "Forever revisions (lifetime support)",
        "48-hour priority delivery"
      ],
      message: "Executive Impact Package - Premium Service",
      bonuses: ["LinkedIn Executive Optimization", "Personal Branding Guide", "Executive Interview Prep", "Salary Negotiation Playbook"]
    },
    {
      name: "Professional Resume Writing",
      investment: currency === 'USD' ? '$50' : '₹999',
      originalPrice: currency === 'USD' ? '$75' : '₹1,499',
      savings: currency === 'USD' ? '$25' : '₹500',
      perDay: currency === 'USD' ? '$1.67' : '₹33',
      audience: "Experienced Professionals (5+ years)",
      popular: true,
      outcomes: [
        "ATS-optimized resume formatting",
        "Achievement-focused content rewriting",
        "Industry-standard keyword optimization",
        "Clean, professional layout",
        "LinkedIn profile optimization (FREE)",
        "Cover letter template (FREE)"
      ],
      message: "Professional Resume Writing Service",
      bonuses: ["LinkedIn Optimization", "Cover Letter", "Interview Guide"]
    },
    {
      name: "Career Starter Package",
      investment: currency === 'USD' ? '$25' : '₹499',
      originalPrice: currency === 'USD' ? '$40' : '₹799',
      savings: currency === 'USD' ? '$15' : '₹300',
      perDay: currency === 'USD' ? '$0.83' : '₹17',
      audience: "Early Career (1-4 years experience)",
      outcomes: [
        "Skills-based resume structure",
        "Project experience highlighting",
        "Modern, clean design template",
        "Entry-level keyword optimization",
        "Resume template pack (FREE)",
        "Email signature (FREE)"
      ],
      message: "Career Starter Resume Service",
      bonuses: ["Template Pack", "Email Signature"]
    },
    {
      name: "Student & Fresher Package",
      investment: currency === 'USD' ? '$15' : '₹299',
      originalPrice: currency === 'USD' ? '$30' : '₹599',
      savings: currency === 'USD' ? '$15' : '₹300',
      perDay: currency === 'USD' ? '$0.50' : '₹10',
      audience: "Students & Recent Graduates",
      outcomes: [
        "Education-focused layout",
        "Internship & project highlighting",
        "Modern template selection",
        "Graduate-level optimization",
        "Internship application guide (FREE)",
        "Entry-level job tips (FREE)"
      ],
      message: "Student & Fresher Resume Service",
      bonuses: ["Internship Guide", "Job Tips"]
    }
  ];

  // Live activity feed
  const recentActivity = [
    { name: "Rohit", city: "Delhi", action: "booked Professional Package", time: "2 min ago" },
    { name: "Anjali", city: "Mumbai", action: "received her resume", time: "1 hour ago" },
    { name: "Karan", city: "Bangalore", action: "booked Career Starter", time: "15 min ago" },
    { name: "Meera", city: "Pune", action: "got 3 interview calls", time: "3 hours ago" }
  ];

  // FAQ Data
  const faqData = [
    {
      question: "What does ATS-optimized mean?",
      answer: "ATS-optimized means your resume is formatted to be easily read by applicant tracking systems used by companies. This includes proper section headings, clean formatting, and relevant keywords for your industry."
    },
    {
      question: "Do you format resumes for US companies?",
      answer: "Yes! We specialize in US resume formats used by TCS, Infosys, Wipro, HCL, HDFC, ICICI, and other top US companies. We understand the specific requirements and keywords US recruiters look for."
    },
    {
      question: "How long does the process take?",
      answer: "Most resumes are completed within 1-2 business days. We'll provide updates via WhatsApp throughout the process. Rush delivery (24 hours) available for an additional fee."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept UPI (PhonePe, Google Pay, Paytm), Net Banking, Credit/Debit Cards, and Wallets. You can pay ₹499 now and ₹500 after delivery, or pay the full amount upfront."
    },
    {
      question: "Can you help with resumes for abroad jobs (US, UK, Canada)?",
      answer: "Yes! We have experience creating resumes for international job markets. Just mention your target country when you contact us, and we'll format it accordingly."
    },
    {
      question: "Do you support US resume formats (with photo)?",
      answer: "Yes, we can include a professional photo in your resume if required. However, we recommend checking if your target company accepts resumes with photos, as some international companies prefer resumes without photos."
    },
    {
      question: "What information do I need to provide?",
      answer: "Share your current resume, target job roles or industries, and any specific requirements. The more context you provide, the better we can tailor your resume."
    },
    {
      question: "Do you offer revisions?",
      answer: "Yes, we include 1-2 rounds of revisions to ensure you're satisfied with the final result. Additional revisions available at a nominal fee."
    },
    {
      question: "What if I'm not satisfied with the resume?",
      answer: "We include 1-2 rounds of revisions to ensure you're happy with the final result. If you have specific concerns, please let us know during the revision process, and we'll work with you to address them."
    },
    {
      question: "Can you help with resume translation?",
      answer: "Yes, we can help translate your resume to Hindi, Tamil, Telugu, or other regional languages for consultation purposes. However, we recommend keeping the final resume in English for most job applications."
    },
    {
      question: "How do I get started?",
      answer: "Click any \"Get Started\" button to message us on WhatsApp. We'll discuss your needs and provide a quote based on your experience level. You can also call us at +91 8431256903."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 text-center text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            Trusted by 5,000+ professionals across India
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            4.8/5 Rating (500+ Reviews)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {bookingsToday} booked today
          </span>
        </div>
      </div>

      {/* Floating WhatsApp Button - Enhanced */}
      <button
        onClick={() => handleWhatsAppClick()}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group animate-pulse"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#25D366] text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Average response: 2 minutes
        </span>
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
          {slotsRemaining}
        </div>
      </button>

      {/* Quick Intake Form Button - Adjusted position */}
      <button
        onClick={() => setShowQuickForm(true)}
        className="fixed bottom-28 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        aria-label="Quick Form"
      >
        <FileText className="w-5 h-5" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Quick Request
        </span>
      </button>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Share & Get ₹50 OFF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section - Enhanced */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <FileText className="w-4 h-4" />
            <span>Professional Resume Service</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Only {slotsRemaining} slots left this week</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Professional Resume Writing
            <span className="block text-blue-600 mt-2 text-2xl sm:text-3xl md:text-4xl">
              ATS-Friendly & Interview-Ready
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-4 leading-relaxed"
          >
            <span className="font-bold text-red-600">90% of US resumes fail ATS screening.</span> We create clean, professional resumes optimized for applicant tracking systems used by TCS, Infosys, Wipro, and other top US companies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto mb-8"
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🎯 US Resume Problem:</span> Most US resumes are 3-4 pages long and missing keywords that recruiters search for. We fix this!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>ATS Optimized</span>
              </div>
              <p className="text-xs text-gray-600">Clean formatting for tracking systems</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Quick Turnaround</span>
              </div>
              <p className="text-xs text-gray-600">1-2 business days delivery</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                <span>Quality Assured</span>
              </div>
              <p className="text-xs text-gray-600">Professional standards guaranteed</p>
            </div>
          </motion.div>

          {/* Payment Options */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6 text-sm text-gray-600"
          >
            <span className="flex items-center gap-1">
              <USRupee className="w-4 h-4" />
              UPI
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              Cards
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Secure Payment
            </span>
            <span>•</span>
            <span>Pay ₹499 now, ₹500 after delivery</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <button
              onClick={() => handleWhatsAppClick('Professional resume service')}
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto text-lg"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Get Started on WhatsApp</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Reply in 2 min</span>
            </button>
            <button
              onClick={handleCallClick}
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-900 font-medium px-6 py-3 rounded-lg transition-all bg-white hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow w-full sm:w-auto"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call +91 8431256903</span>
            </button>
          </motion.div>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Available: 9 AM - 9 PM IST • Weekend support available
          </p>
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">Live Activity</span>
          </div>
          <div className="space-y-2">
            {recentActivity.slice(0, 2).map((activity, idx) => (
              <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-semibold text-gray-900">{activity.name}</span>
                <span>from {activity.city}</span>
                <span className="text-blue-600">{activity.action}</span>
                <span className="text-gray-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Before/After Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto mb-16 bg-white rounded-xl border border-gray-200 shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See the Difference</h2>
            <p className="text-gray-600">Real results from our resume optimization</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Before (Typical US Resume)
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>4 pages long, cluttered</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>45% ATS score</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>0-1 interview calls per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Missing keywords</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                After (Our Optimized Resume)
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>2 pages, clean & professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>92% ATS score</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>3-5 interview calls per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Industry keywords optimized</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-900">
              Average: <span className="text-blue-600">3x more interview calls</span> after optimization
            </p>
          </div>
        </motion.div>

        {/* Industry-Specific Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Optimized for US Companies</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Industry-specific formats for top US employers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryPackages.map((pkg, index) => (
              <div
                key={pkg.name}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{pkg.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{pkg.companies}</p>
                <p className="text-xl font-bold text-blue-600">{pkg.price}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Service Packages - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Service</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the package that matches your experience level and career goals
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            {servicePackages.map((pkg, index) => (
              <div
                key={pkg.name}
                className={`relative bg-white border-2 ${pkg.executive
                  ? 'border-transparent bg-gradient-to-br from-purple-50 to-indigo-50 shadow-2xl ring-2 ring-purple-300'
                  : pkg.popular
                    ? 'border-blue-500 shadow-xl'
                    : 'border-gray-200'
                  } rounded-xl overflow-hidden p-6 flex flex-col h-full`}
              >
                {pkg.executive && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {pkg.badge}
                  </div>
                )}
                {pkg.popular && !pkg.executive && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500">{pkg.audience}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-2xl font-bold text-gray-900">{pkg.investment}</p>
                    <p className="text-sm text-gray-500 line-through">{pkg.originalPrice}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                      Save {pkg.savings}
                    </span>
                    <span className="text-xs text-gray-500">Only {pkg.perDay}/day</span>
                  </div>
                  <p className="text-xs text-gray-500">One-time payment</p>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  {pkg.outcomes.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {pkg.bonuses.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-2">FREE BONUSES (Worth ₹{pkg.bonuses.length * 299}):</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.bonuses.map((bonus, idx) => (
                        <span key={idx} className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200">
                          {bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleWhatsAppClick(pkg.message)}
                  className={`inline-flex items-center justify-center gap-2 ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Get This Package</span>
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Us?</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Freelancer</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Agency</th>
                    <th className="text-center py-3 px-4 font-semibold text-blue-600">ExpertResume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Price</td>
                    <td className="text-center py-3 px-4">₹2,000</td>
                    <td className="text-center py-3 px-4">₹5,000</td>
                    <td className="text-center py-3 px-4 font-bold text-blue-600">₹999</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">ATS Optimization</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4 font-bold text-green-600">✅</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">US Company Formats</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">Sometimes</td>
                    <td className="text-center py-3 px-4 font-bold text-green-600">✅</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">Revisions</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">2</td>
                    <td className="text-center py-3 px-4 font-bold text-green-600">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories from India</h2>
            <p className="text-gray-600">Real results from professionals across India</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <span className="flex items-center gap-1 text-yellow-500">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-500" />
                        ))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{testimonial.city}</span>
                      <span>•</span>
                      <Building2 className="w-3 h-3" />
                      <span>{testimonial.company}</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">{testimonial.role} • {testimonial.salary}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What We Deliver - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Receive</h2>
              <p className="text-gray-600">Professional resume service with clear deliverables</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Deliverables</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">ATS-optimized resume in PDF formats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Clean, professional layout and formatting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Industry-appropriate keyword optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Clear section organization and hierarchy</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">1-2 rounds of revisions included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Professional formatting and spacing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Clear communication via WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">1-2 business days delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Free Bonuses */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🎁 FREE BONUSES (Worth ₹1,297)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">LinkedIn Profile Optimization</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FREE</span>
                  </div>
                  <p className="text-sm text-gray-600">Worth ₹499 - Optimize your LinkedIn to match your resume</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Cover Letter Template</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FREE</span>
                  </div>
                  <p className="text-sm text-gray-600">Worth ₹299 - Professional cover letter template</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Interview Prep Guide</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FREE</span>
                  </div>
                  <p className="text-sm text-gray-600">Worth ₹199 - 20 common interview questions & answers</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Email Signature Template</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FREE</span>
                  </div>
                  <p className="text-sm text-gray-600">Worth ₹99 - Professional email signature</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simple Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple 3-Step Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Straightforward process to get your professional resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Details</h3>
              <p className="text-sm text-gray-600">Send your current resume and target roles via WhatsApp</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">We Create & Review</h3>
              <p className="text-sm text-gray-600">We build your ATS-optimized resume and share for feedback</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Final Delivery</h3>
              <p className="text-sm text-gray-600">Receive your final resume files in PDF formats</p>
            </div>
          </div>
        </motion.div>

        {/* Referral Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white"
        >
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Refer a Friend, Get Rewarded! 🎁</h2>
            <p className="text-lg mb-6 text-purple-100">
              Share with friends and both of you get 15% discount on your next order
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Share & Get ₹150 OFF</span>
              </button>
              <button
                onClick={() => handleWhatsAppClick('Referral program')}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-blue-600 rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-bold transform rotate-12 translate-x-8 translate-y-4">
              Only {slotsRemaining} slots left!
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready for a Professional Resume?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 5,000+ professionals who got their dream jobs with our optimized resumes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => handleWhatsAppClick('Professional resume service')}
                className="inline-flex items-center justify-center gap-3 bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto text-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Start on WhatsApp</span>
              </button>
              <button
                onClick={handleCallClick}
                className="inline-flex items-center justify-center gap-2 border border-white text-white font-semibold px-7 py-4 rounded-lg transition-all hover:bg-white/10 w-full sm:w-auto"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call +91 8431256903</span>
              </button>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              💬 Average response time: 2 minutes • Available 9 AM - 9 PM IST
            </p>
          </div>
        </motion.div>

        {/* FAQ Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Common questions about our resume service</p>
          </div>

          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Internal Linking Section - SEO */}
        <div className="max-w-6xl mx-auto mt-20 border-t border-gray-200 pt-12 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Explore More Free Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/free-ai-resume-builder" className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
              <span className="block font-semibold text-gray-900 mb-1 group-hover:text-blue-600">AI Resume Builder</span>
              <span className="text-xs text-gray-500">Create free resumes</span>
            </Link>
            <Link href="/ats-resume-score" className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
              <span className="block font-semibold text-gray-900 mb-1 group-hover:text-blue-600">ATS Score Checker</span>
              <span className="text-xs text-gray-500">Check resume score</span>
            </Link>
            <Link href="/resume-templates" className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
              <span className="block font-semibold text-gray-900 mb-1 group-hover:text-blue-600">Resume Templates</span>
              <span className="text-xs text-gray-500">Download formats</span>
            </Link>
            <Link href="/resume-builder" className="group p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
              <span className="block font-semibold text-gray-900 mb-1 group-hover:text-blue-600">Fresher Formats</span>
              <span className="text-xs text-gray-500">Entry-level CVs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        onWhatsAppClick={() => handleWhatsAppClick('Exit popup offer')}
      />

      {/* Quick Intake Form Modal */}
      <QuickIntakeForm
        isOpen={showQuickForm}
        onClose={() => setShowQuickForm(false)}
        onSubmit={handleQuickFormSubmit}
      />

      {/* Scroll Progress Indicator */}
      {scrollProgress > 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-40"
        >
          <p className="text-sm font-semibold">Scrolled 80%? Get ₹100 OFF! 🎉</p>
        </motion.div>
      )}

      {/* JSON-LD Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://expertresume.us"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Book Resume Service",
                    "item": "https://expertresume.us/book-resume-service"
                  }
                ]
              },
              {
                "@type": "FAQPage",
                "mainEntity": faqData.map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              },
              {
                "@type": "ProfessionalService",
                "name": "ExpertResume - Executive Resume Writing Service",
                "description": "Premium resume writing for executives, senior managers & C-suite professionals in India. ATS-optimized CVs that land ₹25L+ roles.",
                "url": "https://expertresume.us/book-resume-service",
                "telephone": "+918431256903",
                "priceRange": "₹299-₹19,999",
                "image": "https://expertresume.us/og-executive-service.png",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "addressCountry": "IN"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "reviewCount": "500",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "offers": [
                  {
                    "@type": "Offer",
                    "name": "Executive Impact Package",
                    "description": "Premium resume service for C-Suite, VPs, Directors, and Senior Management professionals earning ₹15L+",
                    "price": "19999",
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock",
                    "validFrom": "2025-01-01"
                  },
                  {
                    "@type": "Offer",
                    "name": "Professional Resume Writing",
                    "description": "ATS-optimized resume for experienced professionals with 5+ years experience",
                    "price": "999",
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock",
                    "validFrom": "2025-01-01"
                  }
                ],
                "areaServed": [
                  { "@type": "City", "name": "Bangalore" },
                  { "@type": "City", "name": "Mumbai" },
                  { "@type": "City", "name": "Delhi" },
                  { "@type": "City", "name": "Pune" },
                  { "@type": "City", "name": "Hyderabad" }
                ],
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Resume Writing Services",
                  "itemListElement": [
                    {
                      "@type": "OfferCatalog",
                      "name": "Executive Resume Services",
                      "itemListElement": [
                        {
                          "@type": "Offer",
                          "itemOffered": {
                            "@type": "Service",
                            "name": "C-Suite Resume Writing",
                            "description": "Executive positioning and personal branding for C-level professionals"
                          }
                        },
                        {
                          "@type": "Offer",
                          "itemOffered": {
                            "@type": "Service",
                            "name": "LinkedIn Executive Profile Optimization",
                            "description": "Transform your LinkedIn presence for executive-level opportunities"
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "@type": "Organization",
                "name": "ExpertResume",
                "url": "https://expertresume.us",
                "logo": "https://expertresume.us/ExpertResume.png",
                "sameAs": [
                  "https://www.linkedin.com/company/expertresume",
                  "https://twitter.com/expertresume"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+918431256903",
                  "contactType": "Customer Service",
                  "areaServed": "IN",
                  "availableLanguage": ["English", "Hindi"]
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
