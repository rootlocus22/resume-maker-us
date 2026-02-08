"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw,
  HelpCircle,
  BookOpen,
  Target,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Info,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Settings,
  Award,
  Building,
  Search,
  Folder,
  CreditCard,
  Clock,
  Mail,
  Phone
} from "lucide-react";

// Persona-specific guided tours and hints
const PERSONA_GUIDES = {
  educational: {
    color: "blue",
    welcomeMessage: "Welcome to your Student Management Hub! Let's help you get started with managing student profiles and tracking placements.",
    features: {
      dashboard: {
        title: "Student Dashboard Overview",
        description: "Your central command center for student management",
        hints: [
          {
            id: "stats-cards",
            title: "Monitor Key Metrics",
            description: "Track total students, resume completion, and placement rates at a glance",
            element: "[data-guide='stats-cards']",
            position: "bottom"
          },
          {
            id: "quick-actions",
            title: "Quick Actions",
            description: "Rapidly add students, generate reports, or access frequently used features",
            element: "[data-guide='quick-actions']",
            position: "left"
          },
          {
            id: "recent-activity",
            title: "Stay Updated",
            description: "Monitor recent student activities and system updates in real-time",
            element: "[data-guide='recent-activity']",
            position: "top"
          }
        ]
      },
      students: {
        title: "Student Management",
        description: "Comprehensive student profile and progress tracking",
        hints: [
          {
            id: "add-students",
            title: "Add Your First Students",
            description: "Start by importing students via CSV or adding them individually",
            element: "[data-guide='add-students']",
            position: "bottom"
          },
          {
            id: "bulk-actions",
            title: "Bulk Operations",
            description: "Select multiple students to send emails, export data, or update statuses",
            element: "[data-guide='bulk-actions']",
            position: "top"
          },
          {
            id: "search-filter",
            title: "Smart Search & Filters",
            description: "Quickly find students by name, course, or status using powerful filters",
            element: "[data-guide='search-filter']",
            position: "bottom"
          }
        ]
      },
      analytics: {
        title: "Analytics & Insights",
        description: "Data-driven insights for better decision making",
        hints: [
          {
            id: "placement-trends",
            title: "Placement Trends",
            description: "Track placement success rates over time and identify improvement opportunities",
            element: "[data-guide='placement-trends']",
            position: "right"
          },
          {
            id: "department-comparison",
            title: "Department Performance",
            description: "Compare performance across different departments to optimize resources",
            element: "[data-guide='department-comparison']",
            position: "left"
          }
        ]
      }
    }
  },
  hr_services: {
    color: "green",
    welcomeMessage: "Welcome to your Recruitment Command Center! Let's optimize your candidate management and placement process.",
    features: {
      dashboard: {
        title: "Recruitment Dashboard",
        description: "Your hub for managing candidates and client relationships",
        hints: [
          {
            id: "candidate-pipeline",
            title: "Candidate Pipeline",
            description: "Track candidates through different stages of the recruitment process",
            element: "[data-guide='candidate-pipeline']",
            position: "bottom"
          },
          {
            id: "client-metrics",
            title: "Client Success Metrics",
            description: "Monitor client satisfaction and placement success rates",
            element: "[data-guide='client-metrics']",
            position: "top"
          }
        ]
      },
      candidates: {
        title: "Candidate Management",
        description: "Efficiently manage your candidate database",
        hints: [
          {
            id: "candidate-scoring",
            title: "Smart Candidate Scoring",
            description: "Use AI-powered scoring to rank candidates for specific roles",
            element: "[data-guide='candidate-scoring']",
            position: "right"
          },
          {
            id: "job-matching",
            title: "Automated Job Matching",
            description: "Let AI suggest the best job matches for each candidate",
            element: "[data-guide='job-matching']",
            position: "left"
          }
        ]
      },
      clients: {
        title: "Client Management",
        description: "Build stronger relationships with your clients",
        hints: [
          {
            id: "client-portal",
            title: "Client Portal Access",
            description: "Provide clients with real-time updates on their recruitment requests",
            element: "[data-guide='client-portal']",
            position: "bottom"
          }
        ]
      }
    }
  },
  resume_writing: {
    color: "purple",
    welcomeMessage: "Welcome to your Project Management Suite! Streamline your resume writing business with powerful tools.",
    features: {
      dashboard: {
        title: "Project Dashboard",
        description: "Manage client projects and track business performance",
        hints: [
          {
            id: "project-timeline",
            title: "Project Timelines",
            description: "Track project deadlines and ensure timely delivery to clients",
            element: "[data-guide='project-timeline']",
            position: "bottom"
          },
          {
            id: "revenue-tracking",
            title: "Revenue Analytics",
            description: "Monitor your business performance and identify growth opportunities",
            element: "[data-guide='revenue-tracking']",
            position: "top"
          }
        ]
      },
      projects: {
        title: "Project Management",
        description: "Organize and track client projects efficiently",
        hints: [
          {
            id: "project-templates",
            title: "Project Templates",
            description: "Use templates to quickly set up new projects with standard workflows",
            element: "[data-guide='project-templates']",
            position: "right"
          },
          {
            id: "client-communication",
            title: "Client Communication Hub",
            description: "Keep all client communications organized within each project",
            element: "[data-guide='client-communication']",
            position: "left"
          }
        ]
      },
      billing: {
        title: "Billing & Invoicing",
        description: "Streamline your financial operations",
        hints: [
          {
            id: "automated-invoicing",
            title: "Automated Invoicing",
            description: "Set up automatic invoice generation based on project milestones",
            element: "[data-guide='automated-invoicing']",
            position: "bottom"
          }
        ]
      }
    }
  },
  corporate: {
    color: "orange",
    welcomeMessage: "Welcome to your Employee Development Center! Enhance your workforce capabilities with comprehensive training tools.",
    features: {
      dashboard: {
        title: "Employee Development Dashboard",
        description: "Track employee growth and training progress",
        hints: [
          {
            id: "skill-matrix",
            title: "Skills Matrix Overview",
            description: "Visualize employee skills across your organization",
            element: "[data-guide='skill-matrix']",
            position: "bottom"
          },
          {
            id: "training-progress",
            title: "Training Progress Tracking",
            description: "Monitor completion rates and identify training gaps",
            element: "[data-guide='training-progress']",
            position: "top"
          }
        ]
      },
      employees: {
        title: "Employee Management",
        description: "Comprehensive employee profile and development tracking",
        hints: [
          {
            id: "career-paths",
            title: "Career Development Paths",
            description: "Define and track individual career progression plans",
            element: "[data-guide='career-paths']",
            position: "right"
          },
          {
            id: "performance-reviews",
            title: "Performance Reviews",
            description: "Schedule and manage regular performance evaluations",
            element: "[data-guide='performance-reviews']",
            position: "left"
          }
        ]
      },
      training: {
        title: "Training Programs",
        description: "Design and manage employee training initiatives",
        hints: [
          {
            id: "training-calendar",
            title: "Training Calendar",
            description: "Schedule and coordinate training sessions across departments",
            element: "[data-guide='training-calendar']",
            position: "bottom"
          }
        ]
      }
    }
  }
};

// Common feature hints that apply to all personas
const COMMON_HINTS = {
  "resume-builder": {
    title: "AI-Powered Resume Builder",
    description: "Create professional resumes with AI assistance",
    tips: [
      "Use job-specific templates for better ATS compatibility",
      "Let AI suggest improvements based on job descriptions",
      "Export in multiple formats for different applications"
    ]
  },
  "ats-checker": {
    title: "ATS Score Checker",
    description: "Optimize resumes for Applicant Tracking Systems",
    tips: [
      "Aim for a score above 80% for better visibility",
      "Use relevant keywords from job descriptions",
      "Avoid complex formatting that ATS can't read"
    ]
  },
  "interview-trainer": {
    title: "AI Interview Trainer",
    description: "Practice interviews with AI-powered coaching",
    tips: [
      "Practice with different interview types (behavioral, technical)",
      "Record sessions to review your performance",
      "Get personalized feedback on your responses"
    ]
  }
};

// Smart hint suggestions based on user behavior
const SMART_SUGGESTIONS = {
  noStudents: {
    icon: <Users className="h-5 w-5 text-blue-500" />,
    title: "Get Started with Students",
    description: "Add your first students to unlock the full potential of the platform",
    action: "Add Students",
    href: "/dashboard/students/add"
  },
  lowEngagement: {
    icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    title: "Boost Student Engagement",
    description: "Send personalized emails to encourage resume completion",
    action: "Send Reminders",
    href: "/dashboard/students?action=bulk-email"
  },
  incompleteProfiles: {
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    title: "Complete Student Profiles",
    description: "Students with complete profiles have 3x higher placement rates",
    action: "Review Profiles",
    href: "/dashboard/students?filter=incomplete"
  },
  noReports: {
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    title: "Generate Your First Report",
    description: "Create insights to share with stakeholders",
    action: "Create Report",
    href: "/dashboard/reports"
  }
};

export default function GuidedHints({ 
  persona = "educational", 
  currentPage = "dashboard", 
  userStats = {},
  onComplete = () => {} 
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [completedHints, setCompletedHints] = useState(new Set());
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [hoveredElement, setHoveredElement] = useState(null);
  
  const personaGuide = PERSONA_GUIDES[persona] || PERSONA_GUIDES.educational;
  const currentFeature = personaGuide.features[currentPage];
  const hints = currentFeature?.hints || [];

  // Check if user is new (show welcome)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(`welcome-${persona}`);
    if (!hasSeenWelcome && currentPage === 'dashboard') {
      setShowWelcome(true);
    }
  }, [persona, currentPage]);

  // Auto-highlight elements when guide is active
  useEffect(() => {
    if (isActive && hints[currentHint]) {
      const element = document.querySelector(hints[currentHint].element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('guided-highlight');
      }
    }
    
    return () => {
      document.querySelectorAll('.guided-highlight').forEach(el => {
        el.classList.remove('guided-highlight');
      });
    };
  }, [isActive, currentHint, hints]);

  const startGuide = () => {
    setIsActive(true);
    setCurrentHint(0);
  };

  const nextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1);
    } else {
      completeGuide();
    }
  };

  const prevHint = () => {
    if (currentHint > 0) {
      setCurrentHint(currentHint - 1);
    }
  };

  const completeGuide = () => {
    setIsActive(false);
    setCompletedHints(prev => new Set([...prev, currentPage]));
    localStorage.setItem(`guide-completed-${persona}-${currentPage}`, 'true');
    onComplete(currentPage);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(`welcome-${persona}`, 'true');
  };

  // Smart suggestions based on user stats
  const getSmartSuggestions = () => {
    const suggestions = [];
    
    if (userStats.totalStudents === 0) {
      suggestions.push(SMART_SUGGESTIONS.noStudents);
    }
    
    if (userStats.incompleteProfiles > 5) {
      suggestions.push(SMART_SUGGESTIONS.incompleteProfiles);
    }
    
    if (userStats.lowEngagement) {
      suggestions.push(SMART_SUGGESTIONS.lowEngagement);
    }
    
    if (!userStats.hasGeneratedReports) {
      suggestions.push(SMART_SUGGESTIONS.noReports);
    }
    
    return suggestions.slice(0, 2); // Show max 2 suggestions
  };

  // Floating hint button
  const FloatingHintButton = () => (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={startGuide}
      className={`fixed bottom-6 right-6 z-[9998] bg-${personaGuide.color}-600 text-white p-4 rounded-full shadow-lg hover:bg-${personaGuide.color}-700 transition-colors border-2 border-white`}
      title="Start guided tour"
    >
      <Lightbulb className="h-6 w-6" />
    </motion.button>
  );

  // Welcome modal
  const WelcomeModal = () => (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-gray-200 z-[10000]"
          >
            <div className="text-center">
              <div className={`w-16 h-16 bg-${personaGuide.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Star className={`h-8 w-8 text-${personaGuide.color}-600`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to ExpertResume!
              </h2>
              <p className="text-gray-600 mb-6">
                {personaGuide.welcomeMessage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    dismissWelcome();
                    startGuide();
                  }}
                  className={`flex-1 bg-${personaGuide.color}-600 text-white py-3 rounded-lg font-medium hover:bg-${personaGuide.color}-700 transition-colors`}
                >
                  Start Tour
                </button>
                <button
                  onClick={dismissWelcome}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Guided tour overlay
  const GuidedTour = () => (
    <AnimatePresence>
      {isActive && hints[currentHint] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-2 border-gray-200 z-[10000]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 bg-${personaGuide.color}-100 rounded-full flex items-center justify-center`}>
                <Target className={`h-5 w-5 text-${personaGuide.color}-600`} />
              </div>
              <button
                onClick={completeGuide}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hints[currentHint].title}
            </h3>
            <p className="text-gray-600 mb-6">
              {hints[currentHint].description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {hints.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentHint ? `bg-${personaGuide.color}-600` : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                {currentHint > 0 && (
                  <button
                    onClick={prevHint}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={nextHint}
                  className={`px-4 py-2 bg-${personaGuide.color}-600 text-white rounded-lg font-medium hover:bg-${personaGuide.color}-700 transition-colors flex items-center gap-2`}
                >
                  {currentHint === hints.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Smart suggestions panel
  const SmartSuggestions = () => {
    const suggestions = getSmartSuggestions();
    
    if (!showSmartSuggestions || suggestions.length === 0) return null;
    
    return (
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed top-20 right-6 z-[9997] bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className={`h-4 w-4 text-${personaGuide.color}-600`} />
            Smart Suggestions
          </h4>
          <button
            onClick={() => setShowSmartSuggestions(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {suggestion.icon}
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 text-sm">{suggestion.title}</h5>
                <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                <a
                  href={suggestion.href}
                  className={`inline-flex items-center gap-1 text-xs font-medium text-${personaGuide.color}-600 hover:text-${personaGuide.color}-700 transition-colors`}
                >
                  {suggestion.action}
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Contextual tooltips
  const ContextualTooltip = ({ element, content }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    
    useEffect(() => {
      const el = document.querySelector(element);
      if (!el) return;
      
      const handleMouseEnter = (e) => {
        const rect = e.target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
        setIsVisible(true);
      };
      
      const handleMouseLeave = () => {
        setIsVisible(false);
      };
      
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [element]);
    
    if (!isVisible) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{ top: position.top, left: position.left }}
        className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 max-w-xs shadow-lg"
      >
        {content}
        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </motion.div>
    );
  };

  return (
    <>
      <WelcomeModal />
      <GuidedTour />
      <SmartSuggestions />
      
      {!isActive && !showWelcome && currentFeature && (
        <FloatingHintButton />
      )}
      
      {/* Add CSS for highlighted elements */}
      <style jsx global>{`
        .guided-highlight {
          position: relative;
          z-index: 9998 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          animation: pulse-guide 2s infinite;
          background-color: rgba(255, 255, 255, 0.95) !important;
        }
        
        @keyframes pulse-guide {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 8px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.8), 0 0 0 12px rgba(59, 130, 246, 0.2);
          }
        }
        
        /* Ensure guided elements are above other content */
        .guided-highlight * {
          position: relative;
          z-index: 9999;
        }
        
        /* Create a backdrop for better visibility */
        .guided-highlight::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 9996;
          pointer-events: none;
        }
        
        /* Improve modal and overlay stacking */
        .modal-overlay {
          z-index: 9999 !important;
        }
        
        .modal-content {
          z-index: 10000 !important;
        }
        
        /* Ensure enterprise layout sidebars don't interfere */
        .enterprise-sidebar {
          z-index: 1000 !important;
        }
        
        .enterprise-header {
          z-index: 1001 !important;
        }
      `}</style>
    </>
  );
}

// Helper component for adding guide attributes to elements
export const GuideElement = ({ guide, children, className = "", ...props }) => {
  return (
    <div 
      data-guide={guide} 
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook for managing guided hints
export const useGuidedHints = (persona) => {
  const [completedGuides, setCompletedGuides] = useState(new Set());
  
  useEffect(() => {
    // Load completed guides from localStorage
    const completed = new Set();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`guide-completed-${persona}-`)) {
        const page = key.replace(`guide-completed-${persona}-`, '');
        completed.add(page);
      }
    });
    setCompletedGuides(completed);
  }, [persona]);
  
  const markCompleted = (page) => {
    setCompletedGuides(prev => new Set([...prev, page]));
    localStorage.setItem(`guide-completed-${persona}-${page}`, 'true');
  };
  
  const isCompleted = (page) => {
    return completedGuides.has(page);
  };
  
  const resetGuides = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`guide-completed-${persona}-`) || key.startsWith(`welcome-${persona}`)) {
        localStorage.removeItem(key);
      }
    });
    setCompletedGuides(new Set());
  };
  
  return {
    completedGuides,
    markCompleted,
    isCompleted,
    resetGuides
  };
}; 