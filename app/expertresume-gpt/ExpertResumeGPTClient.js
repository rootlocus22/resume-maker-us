"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Calculator,
  Brain,
  Target,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Lightbulb,
  Award,
  Clock,
  Star,
  Rocket,
  ChevronDown,
  Video,
  PenTool,
  Database,
  GitBranch,
  Palette,
  BarChart,
  Heart,
  Microscope,
  Building,
  DollarSign,
  Globe,
  Music,
  Stethoscope
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ExpertResumeGPTClient() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("students");
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleGetStarted = () => {
    if (!user) {
      router.push("/signup?redirect=expertresume-gpt");
    } else if (!isPremium) {
      router.push("/pricing?highlight=monthly");
    } else {
      // Redirect to the GPT interface or chat
      router.push("/resume-builder"); // Update with actual GPT interface path
    }
  };

  // Use cases by profession
  const professionCategories = [
    {
      id: "students",
      name: "Students & Learners",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "blue",
      tagline: "Your Academic Success Partner",
      useCases: [
        {
          icon: <Calculator className="w-5 h-5" />,
          title: "Math & Science Problems",
          description: "Get step-by-step solutions for calculus, algebra, physics, chemistry problems. Understand concepts deeply with detailed explanations."
        },
        {
          icon: <Code className="w-5 h-5" />,
          title: "Programming Help",
          description: "Debug code, learn algorithms, understand data structures. Support for Python, Java, C++, JavaScript, and more."
        },
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Essay & Report Writing",
          description: "Get help with research papers, essays, project reports. Improve writing quality, grammar, and structure."
        },
        {
          icon: <BookOpen className="w-5 h-5" />,
          title: "Exam Preparation",
          description: "Study guides, practice questions, concept clarification for SAT, ACT, GRE, GMAT, JEE, NEET, and more."
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: "Project Ideas & Guidance",
          description: "Get innovative project ideas, implementation guidance for final year projects, hackathons, and assignments."
        },
        {
          icon: <Users className="w-5 h-5" />,
          title: "Career Guidance",
          description: "Explore career paths, understand different fields, get advice on courses, internships, and skill development."
        }
      ]
    },
    {
      id: "software",
      name: "Software Engineers",
      icon: <Code className="w-6 h-6" />,
      color: "purple",
      tagline: "Your Coding Interview & Career Coach",
      useCases: [
        {
          icon: <GitBranch className="w-5 h-5" />,
          title: "Coding Interview Prep",
          description: "Practice LeetCode-style problems, get optimal solutions, time complexity analysis. Master data structures & algorithms."
        },
        {
          icon: <Database className="w-5 h-5" />,
          title: "System Design Mastery",
          description: "Learn how to design scalable systems: Twitter, Netflix, Uber. Understand distributed systems, databases, caching strategies."
        },
        {
          icon: <Bug className="w-5 h-5" />,
          title: "Code Review & Debugging",
          description: "Get your code reviewed, find bugs, improve code quality, learn best practices and design patterns."
        },
        {
          icon: <Rocket className="w-5 h-5" />,
          title: "Tech Stack Guidance",
          description: "Choose the right technologies, frameworks, tools. Get architectural advice for your projects and products."
        },
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Resume Optimization",
          description: "Craft technical resumes that pass ATS, highlight projects effectively, showcase skills that matter to recruiters."
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Career Path Planning",
          description: "Navigate from junior to senior roles, understand promotion paths, learn what skills to develop next."
        }
      ]
    },
    {
      id: "business",
      name: "Business Professionals",
      icon: <Briefcase className="w-6 h-6" />,
      color: "green",
      tagline: "Your Business Growth Partner",
      useCases: [
        {
          icon: <BarChart className="w-5 h-5" />,
          title: "Business Analysis",
          description: "Financial modeling, market analysis, competitive research, SWOT analysis, and strategic planning support."
        },
        {
          icon: <Users className="w-5 h-5" />,
          title: "Leadership & Management",
          description: "Team management advice, conflict resolution, performance reviews, leadership skill development."
        },
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Business Writing",
          description: "Create compelling proposals, presentations, business plans, reports, and professional emails."
        },
        {
          icon: <Target className="w-5 h-5" />,
          title: "Interview Preparation",
          description: "MBA interviews, case studies, behavioral questions, executive role preparation with mock interview practice."
        },
        {
          icon: <DollarSign className="w-5 h-5" />,
          title: "Salary Negotiation",
          description: "Get market insights, negotiation strategies, compensation analysis to maximize your earning potential."
        },
        {
          icon: <Lightbulb className="w-5 h-5" />,
          title: "Strategy & Innovation",
          description: "Business strategy development, innovation frameworks, product ideation, and go-to-market planning."
        }
      ]
    },
    {
      id: "creative",
      name: "Creative Professionals",
      icon: <Palette className="w-6 h-6" />,
      color: "pink",
      tagline: "Your Creative Career Catalyst",
      useCases: [
        {
          icon: <Palette className="w-5 h-5" />,
          title: "Portfolio Development",
          description: "Get feedback on design work, build compelling portfolios, showcase projects effectively to potential clients."
        },
        {
          icon: <PenTool className="w-5 h-5" />,
          title: "Content Strategy",
          description: "Content planning, SEO writing, copywriting tips, brand voice development for marketers and content creators."
        },
        {
          icon: <Video className="w-5 h-5" />,
          title: "Creative Direction",
          description: "Design critiques, creative concepts, branding strategies, and visual communication guidance."
        },
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Freelance Business",
          description: "Client proposals, pricing strategies, contract templates, building and scaling your freelance business."
        },
        {
          icon: <Users className="w-5 h-5" />,
          title: "Interview Prep",
          description: "Portfolio presentations, creative role interviews, design challenge preparation, and case study discussions."
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Career Growth",
          description: "Skill development roadmap, industry trends, networking strategies, and personal branding guidance."
        }
      ]
    },
    {
      id: "healthcare",
      name: "Healthcare Professionals",
      icon: <Stethoscope className="w-6 h-6" />,
      color: "red",
      tagline: "Your Medical Career Companion",
      useCases: [
        {
          icon: <Microscope className="w-5 h-5" />,
          title: "Medical Knowledge",
          description: "Clinical case discussions, latest research updates, medical terminology, treatment protocols, and evidence-based practice."
        },
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Research & Publications",
          description: "Research paper writing, literature reviews, grant proposals, and medical documentation support."
        },
        {
          icon: <Users className="w-5 h-5" />,
          title: "Career Advancement",
          description: "Residency applications, fellowship prep, CV optimization, recommendation letters, and career path guidance."
        },
        {
          icon: <BookOpen className="w-5 h-5" />,
          title: "Exam Preparation",
          description: "USMLE, PLAB, NEET-PG preparation support. Clinical scenarios, case studies, and concept clarification."
        },
        {
          icon: <Globe className="w-5 h-5" />,
          title: "International Opportunities",
          description: "Guidance for international medical careers, licensing exams, visa processes, and credential evaluation."
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Professional Development",
          description: "CME recommendations, skill development, specialization guidance, and leadership training advice."
        }
      ]
    },
    {
      id: "general",
      name: "All Professionals",
      icon: <Globe className="w-6 h-6" />,
      color: "indigo",
      tagline: "Universal Career Success Tools",
      useCases: [
        {
          icon: <FileText className="w-5 h-5" />,
          title: "Resume Building",
          description: "Create ATS-optimized resumes, cover letters, LinkedIn profiles tailored to your industry and target roles."
        },
        {
          icon: <MessageSquare className="w-5 h-5" />,
          title: "Interview Preparation",
          description: "Behavioral questions, technical prep, case studies, mock interviews, and post-interview follow-up strategies."
        },
        {
          icon: <Brain className="w-5 h-5" />,
          title: "Skill Development",
          description: "Personalized learning paths, course recommendations, certification guidance, and upskilling strategies."
        },
        {
          icon: <Target className="w-5 h-5" />,
          title: "Career Transition",
          description: "Switch industries, change roles, relocate - get comprehensive guidance for major career changes."
        },
        {
          icon: <DollarSign className="w-5 h-5" />,
          title: "Compensation Strategy",
          description: "Salary benchmarking, negotiation tactics, benefits evaluation, and total compensation optimization."
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Professional Growth",
          description: "Networking strategies, personal branding, thought leadership, and career acceleration tactics."
        }
      ]
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: "Advanced AI Technology",
      description: "Powered by state-of-the-art GPT technology for accurate, contextual, and helpful responses."
    },
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      title: "24/7 Availability",
      description: "Get instant help anytime, anywhere. No waiting for office hours or appointments."
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "Personalized Guidance",
      description: "Tailored advice based on your specific situation, goals, and career stage."
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Multi-Domain Expertise",
      description: "From coding to creative work, business to healthcare - we cover all professional fields."
    },
    {
      icon: <Rocket className="w-8 h-8 text-indigo-600" />,
      title: "Career Acceleration",
      description: "Fast-track your career growth with AI-powered insights and strategies."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Proven Results",
      description: "Join thousands who've advanced their careers and aced interviews with our AI assistant."
    }
  ];

  const faqs = [
    {
      question: "What is ExpertResume GPT?",
      answer: "ExpertResume GPT is your all-in-one AI assistant for career growth and learning. Whether you're a student needing help with math problems, a software engineer preparing for interviews, or a professional looking to advance your career, our AI provides personalized guidance, problem-solving support, and expert advice across all domains."
    },
    {
      question: "How is this different from regular ChatGPT?",
      answer: "While ChatGPT is general-purpose, ExpertResume GPT is specifically trained and optimized for career development, learning, and professional growth. It understands resume building, interview preparation, technical concepts, career transitions, and industry-specific challenges better. Plus, it's integrated with our resume builder, ATS checker, and other career tools for a seamless experience."
    },
    {
      question: "What can I ask ExpertResume GPT?",
      answer: "Anything related to your career, learning, or professional development! Ask for help with: coding problems, system design, math equations, interview questions, resume reviews, career advice, salary negotiation, skill development, project ideas, business strategies, and much more. If it helps you grow professionally or academically, we can help."
    },
    {
      question: "Is ExpertResume GPT included in my subscription?",
      answer: "Yes! ExpertResume GPT is included with all our monthly and longer-term premium plans. It's part of our comprehensive career toolkit designed to help you succeed. Get unlimited access to ask questions, get guidance, and accelerate your career growth."
    },
    {
      question: "Can it help me prepare for specific company interviews?",
      answer: "Absolutely! ExpertResume GPT can help you prepare for interviews at specific companies like Google, Amazon, Microsoft, startups, and more. It knows common interview patterns, company cultures, frequently asked questions, and can provide mock interview practice tailored to your target company and role."
    },
    {
      question: "How accurate and reliable are the responses?",
      answer: "ExpertResume GPT uses advanced AI technology and is continuously updated with the latest information. However, while it provides highly accurate and helpful guidance, we always recommend verifying critical decisions with human professionals, especially for medical, legal, or high-stakes situations. Think of it as your intelligent assistant, not a replacement for human expertise."
    },
    {
      question: "Can students use this for homework help?",
      answer: "Yes! Students can get help understanding concepts, solving problems step-by-step, and learning better study techniques. We encourage using it as a learning tool - understanding the explanations rather than just copying answers. It's perfect for clarifying doubts, exploring topics deeper, and preparing for exams."
    },
    {
      question: "Does it support multiple languages?",
      answer: "Yes, ExpertResume GPT supports multiple languages including English, Hindi, and other major languages. You can ask questions and receive responses in your preferred language, making it accessible to a global audience."
    }
  ];

  const currentCategory = professionCategories.find(cat => cat.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI Technology
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              ExpertResume GPT
              <span className="block text-blue-100 mt-2">Your Ultimate AI Career Partner</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              From solving math problems to acing system design interviews - one AI assistant for all your career & learning needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {!user ? "Get Started Free" : !isPremium ? "Upgrade to Premium" : "Start Using GPT"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <Link
                href="#how-it-works"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Learn More
                <ChevronDown className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                <span>Unlimited Questions</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                <span>24/7 Availability</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                <span>All Professions Covered</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-200" />
                <span>Instant Responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases by Profession */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Everyone, Optimized for You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No matter your field, ExpertResume GPT adapts to your specific needs and helps you excel
          </p>
        </div>

        {/* Profession Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 scrollbar-hide">
          {professionCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                activeTab === category.id
                  ? `bg-${category.color}-600 text-white shadow-lg scale-105`
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Use Cases Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentCategory.name}
            </h3>
            <p className="text-lg text-gray-600">{currentCategory.tagline}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategory.useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 bg-${currentCategory.color}-100 rounded-lg mb-4`}>
                  {useCase.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {useCase.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Start Using ExpertResume GPT
            <Sparkles className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ExpertResume GPT?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge AI technology meets practical career guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-World Examples */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Real Examples of How We Help
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how ExpertResume GPT transforms careers and accelerates learning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
            <div className="flex items-start mb-4">
              <div className="bg-blue-600 p-3 rounded-lg mr-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Software Engineer Interview Prep
                </h3>
                <p className="text-gray-700 mb-4">
                  "I asked ExpertResume GPT to help me prepare for a Google interview. It gave me a 30-day study plan, explained system design concepts, and helped me practice coding problems. Got the offer!"
                </p>
                <p className="text-sm font-semibold text-blue-600">- Raj, Software Engineer at Google</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
            <div className="flex items-start mb-4">
              <div className="bg-indigo-600 p-3 rounded-lg mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Student Academic Success
                </h3>
                <p className="text-gray-700 mb-4">
                  "As a computer science student, I use it for everything - debugging code, understanding algorithms, math problems, even career advice. It's like having a 24/7 tutor!"
                </p>
                <p className="text-sm font-semibold text-indigo-600">- Emily, CS Student at Stanford</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
            <div className="flex items-start mb-4">
              <div className="bg-purple-600 p-3 rounded-lg mr-4">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  MBA Career Transition
                </h3>
                <p className="text-gray-700 mb-4">
                  "Transitioning from engineering to product management was tough. ExpertResume GPT helped me prepare for case studies, revamp my resume, and nail behavioral interviews. Now at a FAANG company!"
                </p>
                <p className="text-sm font-semibold text-purple-600">- David, Product Manager at Meta</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
            <div className="flex items-start mb-4">
              <div className="bg-indigo-600 p-3 rounded-lg mr-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Designer Portfolio Review
                </h3>
                <p className="text-gray-700 mb-4">
                  "Got detailed feedback on my portfolio, tips for presenting case studies, and strategies for freelance pricing. Landed 3 high-paying clients within a month!"
                </p>
                <p className="text-sm font-semibold text-indigo-600">- Laura, UX Designer & Freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get unlimited access to ExpertResume GPT with any monthly plan
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$9.99</div>
                <div className="text-blue-100">30 days access</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$13.99</div>
                <div className="text-blue-100">90 days access</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-bold mb-2">BEST VALUE</div>
                <div className="text-4xl font-bold mb-2">$19.99</div>
                <div className="text-blue-100">6 months access</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing?highlight=monthly"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl"
            >
              View All Plans
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              {!user ? "Start Free Trial" : "Get Started"}
              <Sparkles className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about ExpertResume GPT
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-600 transition-transform flex-shrink-0 ${
                    openFAQ === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openFAQ === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-300" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Your Career Success Journey Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals and students who are using AI to accelerate their growth
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Now
            <Rocket className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bug(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

