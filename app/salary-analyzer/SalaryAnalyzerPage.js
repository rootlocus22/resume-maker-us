"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Briefcase,
  Award,
  BarChart3,
  Target,
  Zap,
  Crown,
  Users,
  Building,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingDown,
  Calendar,
  Lightbulb,
  Shield,
  Globe,
  Smartphone,
  GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { getLocationsForCountry, formatSalaryGlobal, getMarketInfo } from "../lib/globalSalaryData";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";
import toast from "react-hot-toast";
import ProgressOverlay from "../components/ProgressOverlay";
import { hasFeatureAccess } from "../lib/planFeatures";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function SalaryAnalyzerPage() {
  const { isPremium, user, plan } = useAuth();
  const { currency, countryCode, switchCurrency } = useLocation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    experience: "",
    location: "",
    currentSalary: "",
    skills: []
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for plan access
  const [hasAccess, setHasAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get pricing for current currency
  const pricing = getEffectivePricing(currency);
  const monthlyPrice = formatPrice(pricing.monthly, currency);
  const sixMonthPrice = formatPrice(pricing.sixMonth, currency);

  // Calculate yearly details based on 6-month plan (as proxy for best value)
  const yearlyPriceVal = pricing.sixMonth * 2;
  const yearlyPrice = formatPrice(yearlyPriceVal, currency);
  const yearlySavings = Math.round(((pricing.monthly * 12 - yearlyPriceVal) / (pricing.monthly * 12)) * 100);

  const [activeTab, setActiveTab] = useState("overview");

  // Tab change handler (all tabs are now accessible)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);

  // Check if user has access to Salary Analyzer (only for monthly and sixMonth plans)
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
        console.error('Error checking Salary Analyzer access:', error);
        setHasAccess(isPremium); // Fallback to isPremium check
      }
    };

    checkAccess();
  }, [user, plan, isPremium]);

  // Enhanced data options
  const industries = [
    "Technology", "Finance", "Healthcare", "Education", "Marketing",
    "Engineering", "Manufacturing", "Retail", "Consulting", "Media",
    "Real Estate", "Transportation", "Energy", "Government", "Non-Profit"
  ];

  const experiences = [
    "Entry Level (0-2 years)", "Mid Level (3-5 years)",
    "Senior Level (6-8 years)", "Expert Level (9+ years)"
  ];

  const locations = getLocationsForCountry(countryCode);
  const marketInfo = getMarketInfo(countryCode);

  // Industry-specific skill mappings
  const industrySkills = {
    "Technology": [
      "JavaScript", "Python", "React", "Node.js", "AWS", "Azure",
      "Docker", "Kubernetes", "Machine Learning", "Data Science",
      "DevOps", "Agile", "Scrum", "SQL", "MongoDB", "Redis",
      "GraphQL", "TypeScript", "Vue.js", "Angular", "Flutter",
      "React Native", "TensorFlow", "PyTorch", "Kafka", "Elasticsearch",
      "Java", "C++", "Go", "Rust", "Swift", "Kotlin"
    ],
    "Finance": [
      "Financial Modeling", "Excel", "VBA", "Python", "R", "SQL",
      "Bloomberg Terminal", "Risk Management", "Portfolio Management",
      "Quantitative Analysis", "Derivatives", "Fixed Income",
      "Equity Research", "M&A", "CFA", "FRM", "SAS", "Stata",
      "Tableau", "Power BI", "Alteryx", "Machine Learning", "Statistics"
    ],
    "Healthcare": [
      "Clinical Research", "Medical Coding", "HIPAA", "EMR Systems",
      "Healthcare Analytics", "Patient Care", "Medical Terminology",
      "Pharmaceutical Knowledge", "Regulatory Compliance", "Quality Assurance",
      "Data Analysis", "Statistics", "SAS", "R", "Python", "SQL",
      "Healthcare IT", "Telemedicine", "Population Health", "Epidemiology"
    ],
    "Education": [
      "Curriculum Development", "Student Assessment", "Learning Management Systems",
      "Educational Technology", "Classroom Management", "Special Education",
      "Online Teaching", "Instructional Design", "Educational Psychology",
      "Data Analysis", "Research Methods", "Statistics", "SPSS", "R",
      "Microsoft Office", "Google Workspace", "Video Editing", "Content Creation"
    ],
    "Marketing": [
      "Digital Marketing", "SEO", "SEM", "Google Analytics", "Facebook Ads",
      "Content Marketing", "Email Marketing", "Social Media Marketing",
      "Marketing Automation", "CRM Systems", "Adobe Creative Suite",
      "Google Ads", "LinkedIn Ads", "Influencer Marketing", "Brand Management",
      "Market Research", "Data Analysis", "A/B Testing", "Conversion Optimization"
    ],
    "Engineering": [
      "AutoCAD", "SolidWorks", "MATLAB", "ANSYS", "Creo", "CATIA",
      "3D Modeling", "Finite Element Analysis", "Thermal Analysis",
      "Structural Analysis", "Fluid Dynamics", "Control Systems",
      "PLC Programming", "SCADA", "IoT", "Robotics", "Mechatronics",
      "Manufacturing Processes", "Quality Control", "Six Sigma"
    ],
    "Manufacturing": [
      "Lean Manufacturing", "Six Sigma", "Quality Control", "Process Improvement",
      "Supply Chain Management", "Inventory Management", "ERP Systems",
      "SAP", "Oracle", "Production Planning", "Maintenance Management",
      "Safety Management", "ISO Standards", "Statistical Process Control",
      "CAD/CAM", "CNC Programming", "Welding", "Machining", "Assembly"
    ],
    "Retail": [
      "Inventory Management", "Point of Sale Systems", "Customer Service",
      "Sales Management", "Visual Merchandising", "E-commerce", "Shopify",
      "WooCommerce", "Amazon Seller Central", "Google Analytics",
      "Social Media Marketing", "Email Marketing", "CRM Systems",
      "Supply Chain Management", "Retail Analytics", "Loss Prevention"
    ],
    "Consulting": [
      "Strategy Development", "Business Analysis", "Project Management",
      "Change Management", "Process Improvement", "Data Analysis",
      "Excel", "PowerPoint", "Tableau", "Power BI", "SQL", "Python",
      "Stakeholder Management", "Presentation Skills", "Problem Solving",
      "Market Research", "Financial Modeling", "Risk Assessment"
    ],
    "Media": [
      "Adobe Creative Suite", "Final Cut Pro", "Premiere Pro", "After Effects",
      "Photoshop", "Illustrator", "InDesign", "Video Editing", "Motion Graphics",
      "Content Creation", "Social Media Management", "Digital Marketing",
      "SEO", "Google Analytics", "WordPress", "Content Management Systems",
      "Journalism", "Copywriting", "Storytelling", "Brand Management"
    ],
    "Real Estate": [
      "Property Management", "Real Estate Law", "Market Analysis", "Valuation",
      "Negotiation", "Client Relations", "CRM Systems", "Property Marketing",
      "Investment Analysis", "Financial Modeling", "Excel", "PowerPoint",
      "GIS Software", "Architectural Knowledge", "Construction Management",
      "Lease Administration", "Tenant Relations", "Facility Management"
    ],
    "Transportation": [
      "Logistics Management", "Supply Chain Optimization", "Route Planning",
      "Fleet Management", "Transportation Planning", "GIS Software",
      "SAP", "Oracle", "WMS Systems", "TMS Systems", "Inventory Management",
      "Safety Management", "Compliance", "Data Analysis", "Excel",
      "Project Management", "Cost Analysis", "Performance Metrics"
    ],
    "Energy": [
      "Power Systems", "Renewable Energy", "Energy Management", "Sustainability",
      "Environmental Compliance", "Project Management", "Technical Analysis",
      "Data Analysis", "Excel", "MATLAB", "AutoCAD", "ETAP", "PSSE",
      "SCADA Systems", "Grid Management", "Energy Trading", "Risk Management"
    ],
    "Government": [
      "Policy Analysis", "Public Administration", "Regulatory Compliance",
      "Grant Writing", "Program Management", "Data Analysis", "Excel",
      "PowerPoint", "Report Writing", "Stakeholder Management",
      "Budget Management", "Performance Measurement", "GIS Software",
      "Database Management", "Project Management", "Public Relations"
    ],
    "Non-Profit": [
      "Grant Writing", "Fundraising", "Donor Relations", "Program Management",
      "Volunteer Management", "Event Planning", "Social Media Marketing",
      "Content Creation", "Data Analysis", "Excel", "PowerPoint",
      "CRM Systems", "Budget Management", "Impact Measurement",
      "Advocacy", "Community Outreach", "Partnership Development"
    ]
  };

  // Get skills for selected industry
  const skillOptions = formData.industry ? (industrySkills[formData.industry] || []) : [];

  // Clear skills when industry changes
  useEffect(() => {
    if (formData.industry && formData.skills.length > 0) {
      const newSkills = formData.skills.filter(skill =>
        industrySkills[formData.industry]?.includes(skill)
      );
      if (newSkills.length !== formData.skills.length) {
        setFormData(prev => ({ ...prev, skills: newSkills }));
      }
    }
  }, [formData.industry]);

  // No longer needed since all tabs are accessible
  // useEffect(() => {
  //   if (!isPremium && activeTab !== "overview") {
  //     setActiveTab("overview");
  //   }
  // }, [isPremium, activeTab]);

  // Load user's analysis count
  useEffect(() => {
    if (user && !isPremium) {
      // This would typically come from user data, but for now we'll start at 0
      // In a real app, you'd fetch this from the user's profile
      setAnalysisCount(0);
    }
  }, [user, isPremium]);

  const formatSalary = (amount) => {
    if (!amount) return "N/A";
    return formatSalaryGlobal(amount, currency);
  };

  const analyzeSalary = async () => {
    if (!formData.jobTitle || !formData.industry || !formData.experience || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Redirect to pricing if free user has reached limit
    if (!isPremium && analysisCount >= 1) {
      window.location.href = "/pricing";
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowProgressOverlay(true);

    try {
      const response = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "anonymous",
          currency,
          countryCode,
          ...formData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.limitReached) {
          toast.error("Free users are limited to 1 analysis. Upgrade to Premium for unlimited access!");
        } else {
          throw new Error(result.error || "Failed to analyze salary");
        }
        return;
      }

      setAnalysisResult(result.data);

      // Increment analysis count for free users
      if (!isPremium) {
        setAnalysisCount(prev => prev + 1);
      }

      // Save analysis
      const newAnalysis = {
        ...formData,
        result: result.data,
        timestamp: new Date().toISOString()
      };
      setSavedAnalyses(prev => [newAnalysis, ...prev.slice(0, 4)]);

      toast.success("Salary analysis completed!");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to analyze salary. Please try again.");
    } finally {
      setIsLoading(false);
      setShowProgressOverlay(false);
    }
  };

  const getDemandColor = (demand) => {
    switch (demand?.toLowerCase()) {
      case "very high": return "text-green-600 bg-green-100";
      case "high": return "text-[#0B1F3B] bg-[#0B1F3B]/10";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case "growing": return <TrendingUp className="text-green-500" size={16} />;
      case "stable": return <BarChart3 className="text-[#0B1F3B]" size={16} />;
      case "declining": return <TrendingDown className="text-red-500" size={16} />;
      default: return <BarChart3 className="text-gray-500" size={16} />;
    }
  };

  // Show upgrade modal if user doesn't have access to Salary Analyzer
  if (showUpgradeModal && !hasAccess && user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#0B1F3B] to-[#132D54] rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-[#00C4B3]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade to Pro for Salary Analyzer
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              The Salary Analyzer feature is available for <strong>Pro Monthly</strong> and <strong>Pro 6-Month</strong> plans.
            </p>
            <div className="bg-[#0B1F3B]/5 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Unlock with Pro Plans:</h3>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#00C4B3]" size={20} />
                  <span>JD Builder - Tailor to Any Job</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#00C4B3]" size={20} />
                  <span>ExpertResume GPT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#00C4B3]" size={20} />
                  <span>Salary Analyzer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-[#00C4B3]" size={20} />
                  <span>Unlimited Downloads</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/checkout?billingCycle=monthly')}
                className="flex-1 bg-[#0B1F3B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#132D54] transition-all"
              >
                Upgrade to Pro Monthly
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="flex-1 border-2 border-[#0B1F3B] text-[#0B1F3B] px-6 py-3 rounded-lg font-semibold hover:bg-[#0B1F3B]/5 transition-all"
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-r from-[#0B1F3B] to-[#132D54] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
                <Crown className="mr-1.5 text-[#00C4B3]" size={14} />
                Premium Salary Intelligence
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Know Your <span className="text-[#00C4B3]">True Worth</span>
              </h1>

              <p className="text-slate-300 max-w-xl text-sm mb-4">
                AI-powered salary analysis with market insights, negotiation strategies, and company benchmarks
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-200 text-xs">
                    {marketInfo.name} ({currency})
                  </span>
                </div>
                {countryCode !== "IN" && (
                  <div className="flex items-center gap-1.5 bg-[#00C4B3]/20 rounded-full px-3 py-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00C4B3]" />
                    <span className="text-[#00C4B3] text-xs">Global Ready</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats - Side */}
            <div className="flex gap-6 lg:gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C4B3]">94%</div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C4B3]">$12K</div>
                <div className="text-xs text-slate-400">Avg. Boost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C4B3]">50K+</div>
                <div className="text-xs text-slate-400">Data Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0B1F3B]/10 rounded-lg flex items-center justify-center">
                    <Target className="text-[#0B1F3B]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Salary Analysis</h2>
                    <p className="text-sm text-gray-600">Get comprehensive insights</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <select
                    value={currency}
                    onChange={(e) => switchCurrency(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                  >
                    <option value="">Select Experience</option>
                    {experiences.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Salary (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentSalary: e.target.value }))}
                    placeholder="Enter your current salary"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C4B3] focus:border-[#00C4B3] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills</label>
                  {!formData.industry ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <div className="text-gray-500 text-sm">
                        Select an industry to see relevant skills
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {skillOptions.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                              } else {
                                setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
                              }
                            }}
                            className="rounded border-gray-300 text-[#0B1F3B] focus:ring-[#00C4B3]"
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                  )}
                  {formData.skills.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzeSalary}
                  disabled={isLoading || (!isPremium && analysisCount >= 1)}
                  className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${isLoading || (!isPremium && analysisCount >= 1)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#0B1F3B] hover:bg-[#132D54] shadow-lg"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      AI Analysis in Progress...
                    </>
                  ) : !isPremium && analysisCount >= 1 ? (
                    <>
                      <Crown size={18} />
                      Upgrade for More
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Start AI Analysis
                    </>
                  )}
                </motion.button>

                {!isPremium && (
                  <div className="bg-[#0B1F3B]/5 border border-[#0B1F3B]/15 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="text-[#0B1F3B]" size={16} />
                      <span className="text-sm font-medium text-[#0B1F3B]">Premium Feature</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Free users get 1 analysis. Upgrade for unlimited access and advanced insights.
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-600">Analyses used:</span>
                      <span className="text-xs font-medium text-[#0B1F3B]">{analysisCount}/1</span>
                    </div>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#132D54] transition-colors"
                    >
                      Upgrade Now
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {analysisResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Tab Navigation */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "market", label: "Market Insights", icon: TrendingUp },
                        { id: "negotiation", label: "Negotiation", icon: Target },
                        { id: "companies", label: "Companies", icon: Building },
                        { id: "skills", label: "Skills", icon: Zap }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                              ? "bg-[#0B1F3B]/10 text-[#0B1F3B] border border-[#0B1F3B]/20"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                          <tab.icon size={16} />
                          {tab.label}
                          {!isPremium && tab.id !== "overview" && (
                            <Crown size={12} className="text-amber-500" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                      {activeTab === "overview" && (
                        <div className="space-y-6">
                          {/* Salary Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-[#0B1F3B]/5 to-[#0B1F3B]/10 p-6 rounded-xl border border-[#0B1F3B]/15">
                              <div className="flex items-center gap-3 mb-3">
                                <DollarSign className="text-[#0B1F3B]" size={20} />
                                <span className="text-sm font-medium text-[#0B1F3B]">Average Salary</span>
                              </div>
                              <div className="text-2xl font-bold text-[#0B1F3B]">
                                {formatSalary(analysisResult.marketOverview?.averageSalary)}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Per year</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                              <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="text-green-600" size={20} />
                                <span className="text-sm font-medium text-green-800">Market Trend</span>
                              </div>
                              <div className="text-2xl font-bold text-green-900">
                                {analysisResult.marketOverview?.marketTrend}
                              </div>
                              <div className="text-xs text-green-700 mt-1">
                                {analysisResult.marketOverview?.industryGrowth} growth
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#00C4B3]/5 to-[#00C4B3]/10 p-6 rounded-xl border border-[#00C4B3]/20">
                              <div className="flex items-center gap-3 mb-3">
                                <Users className="text-[#00C4B3]" size={20} />
                                <span className="text-sm font-medium text-[#0B1F3B]">Demand Level</span>
                              </div>
                              <div className="text-2xl font-bold text-[#0B1F3B]">
                                {analysisResult.marketOverview?.demandLevel}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Job market</div>
                            </div>
                          </div>

                          {/* Salary Distribution Bell Curve */}
                          <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Distribution</h3>
                            <div className="relative h-48 bg-white rounded-lg border p-4">
                              {/* Bell Curve Chart */}
                              <div className="relative h-32 mb-4">
                                {/* Bell Curve Background */}
                                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                                  {/* Bell Curve Path */}
                                  <path
                                    d="M 20 100 Q 100 20 180 100 Q 200 80 220 100 Q 300 20 380 100"
                                    fill="none"
                                    stroke="url(#bellGradient)"
                                    strokeWidth="3"
                                    className="transition-all duration-1000"
                                  />

                                  {/* Bell Curve Fill */}
                                  <path
                                    d="M 20 100 Q 100 20 180 100 Q 200 80 220 100 Q 300 20 380 100 L 380 100 L 20 100 Z"
                                    fill="url(#bellFillGradient)"
                                    opacity="0.3"
                                    className="transition-all duration-1000"
                                  />

                                  {/* Gradient Definitions */}
                                  <defs>
                                    <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#00C4B3" />
                                      <stop offset="50%" stopColor="#0B1F3B" />
                                      <stop offset="100%" stopColor="#00C4B3" />
                                    </linearGradient>
                                    <linearGradient id="bellFillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#00C4B3" stopOpacity="0.1" />
                                      <stop offset="50%" stopColor="#0B1F3B" stopOpacity="0.15" />
                                      <stop offset="100%" stopColor="#00C4B3" stopOpacity="0.1" />
                                    </linearGradient>
                                  </defs>
                                </svg>

                                {/* Percentile Markers */}
                                <div className="absolute inset-0 flex items-end justify-between px-4">
                                  {/* P10 Marker */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-red-400 rounded-full mb-1"></div>
                                    <span className="text-xs text-gray-600 font-medium">10th</span>
                                  </div>

                                  {/* P25 Marker */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-orange-400 rounded-full mb-1"></div>
                                    <span className="text-xs text-gray-600 font-medium">25th</span>
                                  </div>

                                  {/* P50 Marker (Median) */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-6 bg-[#0B1F3B] rounded-full mb-1 shadow-sm"></div>
                                    <span className="text-xs text-[#0B1F3B] font-bold">50th</span>
                                  </div>

                                  {/* P75 Marker */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-orange-400 rounded-full mb-1"></div>
                                    <span className="text-xs text-gray-600 font-medium">75th</span>
                                  </div>

                                  {/* P90 Marker */}
                                  <div className="flex flex-col items-center">
                                    <div className="w-1 h-4 bg-red-400 rounded-full mb-1"></div>
                                    <span className="text-xs text-gray-600 font-medium">90th</span>
                                  </div>
                                </div>

                                {/* Current Salary Indicator */}
                                {analysisResult.comparison?.currentSalary && (
                                  <div
                                    className="absolute bottom-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-md"
                                    style={{
                                      left: `${Math.min(95, Math.max(5, ((analysisResult.comparison.currentSalary - analysisResult.marketOverview?.percentiles?.p10) / (analysisResult.marketOverview?.percentiles?.p90 - analysisResult.marketOverview?.percentiles?.p10)) * 90))}%`
                                    }}
                                  >
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                      You
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Salary Values */}
                              <div className="grid grid-cols-5 gap-2 text-center">
                                <div className="text-xs font-medium text-gray-700">
                                  {formatSalary(analysisResult.marketOverview?.percentiles?.p10)}
                                </div>
                                <div className="text-xs font-medium text-gray-700">
                                  {formatSalary(analysisResult.marketOverview?.percentiles?.p25)}
                                </div>
                                <div className="text-xs font-bold text-[#0B1F3B]">
                                  {formatSalary(analysisResult.marketOverview?.percentiles?.p50)}
                                </div>
                                <div className="text-xs font-medium text-gray-700">
                                  {formatSalary(analysisResult.marketOverview?.percentiles?.p75)}
                                </div>
                                <div className="text-xs font-medium text-gray-700">
                                  {formatSalary(analysisResult.marketOverview?.percentiles?.p90)}
                                </div>
                              </div>

                              {/* Legend */}
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-[#0B1F3B] rounded-full"></div>
                                    <span>Median</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <span>Quartiles</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                    <span>Extremes</span>
                                  </div>
                                  {analysisResult.comparison?.currentSalary && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      <span>Your Position</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Current Salary Comparison */}
                          {analysisResult.comparison && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                              <div className="flex items-center gap-3 mb-4">
                                <Target className="text-yellow-600" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Your Position</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-600">Current Salary</div>
                                  <div className="text-xl font-bold text-gray-900">
                                    {formatSalary(analysisResult.comparison.currentSalary)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Market Position</div>
                                  <div className="text-xl font-bold text-[#0B1F3B]">
                                    {analysisResult.comparison.percentile} Percentile
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-white rounded-lg">
                                <div className="text-sm text-gray-700">
                                  {analysisResult.comparison.recommendation}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Premium Upgrade Section for Free Users */}
                          {!isPremium && (
                            <div className="bg-gradient-to-r from-[#0B1F3B]/5 to-[#00C4B3]/5 p-6 rounded-xl border border-[#0B1F3B]/15">
                              <div className="flex items-center gap-3 mb-4">
                                <Crown className="text-[#0B1F3B]" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Unlock Premium Insights</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">What you'll get with Premium:</h4>
                                  <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-[#00C4B3]" size={16} />
                                      Detailed Market Insights & Trends
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-[#00C4B3]" size={16} />
                                      Negotiation Strategies & Tips
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-[#00C4B3]" size={16} />
                                      Company Benchmarks & Salary Data
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-[#00C4B3]" size={16} />
                                      Skill Analysis & Premium Insights
                                    </li>
                                  </ul>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[#0B1F3B] mb-2">{monthlyPrice}/month</div>
                                  <div className="text-sm text-gray-600 mb-4">or {yearlyPrice}/year (Save {yearlySavings}%)</div>
                                  <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#132D54] transition-all shadow-lg"
                                  >
                                    <Crown size={18} />
                                    Upgrade Now
                                    <ArrowRight size={18} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "market" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Analysis</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">City Premium</span>
                                  <span className="font-semibold">+{((analysisResult.locationAnalysis?.cityPremium - 1) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cost of Living</span>
                                  <span className="font-semibold">{analysisResult.locationAnalysis?.costOfLiving}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Remote Premium</span>
                                  <span className="font-semibold">+{((analysisResult.locationAnalysis?.remoteWorkPremium - 1) * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Impact</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Entry Level</span>
                                  <span className="font-semibold">{formatSalary(analysisResult.experienceImpact?.entryLevel)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mid Level</span>
                                  <span className="font-semibold">{formatSalary(analysisResult.experienceImpact?.midLevel)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Senior Level</span>
                                  <span className="font-semibold">{formatSalary(analysisResult.experienceImpact?.seniorLevel)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Expert Level</span>
                                  <span className="font-semibold">{formatSalary(analysisResult.experienceImpact?.expertLevel)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Blurred section for free users */}
                          {!isPremium && (
                            <div className="relative">
                              <div className="bg-white p-6 rounded-xl border border-gray-200 blur-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">13%</div>
                                    <div className="text-sm text-red-700">Gender Pay Gap</div>
                                  </div>
                                  <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">Increasing</div>
                                    <div className="text-sm text-green-700">Remote Work Trend</div>
                                  </div>
                                  <div className="text-center p-4 bg-[#0B1F3B]/5 rounded-lg">
                                    <div className="text-2xl font-bold text-[#0B1F3B]">Hybrid</div>
                                    <div className="text-sm text-gray-600">Work Culture</div>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center border border-[#0B1F3B]/20">
                                  <Crown className="text-[#0B1F3B] mx-auto mb-3" size={32} />
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Insights</h4>
                                  <p className="text-gray-600 mb-4">Unlock detailed market trends and insights</p>
                                  <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#132D54] transition-all"
                                  >
                                    <Crown size={16} />
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full content for premium users */}
                          {isPremium && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                  <div className="text-2xl font-bold text-red-600">
                                    {(analysisResult.marketInsights?.genderPayGap * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-sm text-red-700">Gender Pay Gap</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {analysisResult.marketInsights?.remoteWorkTrend}
                                  </div>
                                  <div className="text-sm text-green-700">Remote Work Trend</div>
                                </div>
                                <div className="text-center p-4 bg-[#0B1F3B]/5 rounded-lg">
                                  <div className="text-2xl font-bold text-[#0B1F3B]">
                                    {analysisResult.marketInsights?.workCulture}
                                  </div>
                                  <div className="text-sm text-gray-600">Work Culture</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "negotiation" && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-green-50 to-[#00C4B3]/5 p-6 rounded-xl border border-green-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Strategy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Recommended Range</h4>
                                <div className="text-2xl font-bold text-green-600">
                                  {formatSalary(analysisResult.negotiationGuide?.recommendedRange?.min)} - {formatSalary(analysisResult.negotiationGuide?.recommendedRange?.max)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {analysisResult.negotiationGuide?.anchoringStrategy}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Best Timing</h4>
                                <div className="text-lg font-semibold text-[#0B1F3B]">
                                  {analysisResult.negotiationGuide?.timing}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Blurred section for free users */}
                          {!isPremium && (
                            <div className="relative">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 blur-sm">
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-4">Key Talking Points</h4>
                                  <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-green-500" size={16} />
                                      Market demand for your skills
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-green-500" size={16} />
                                      Industry growth rate
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <CheckCircle className="text-green-500" size={16} />
                                      Location premium
                                    </li>
                                  </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-4">Red Flags to Watch</h4>
                                  <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm">
                                      <AlertCircle className="text-red-500" size={16} />
                                      Below market rates
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <AlertCircle className="text-red-500" size={16} />
                                      No growth path
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                      <AlertCircle className="text-red-500" size={16} />
                                      Poor benefits
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center border border-[#0B1F3B]/20">
                                  <Crown className="text-[#0B1F3B] mx-auto mb-3" size={32} />
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Strategy</h4>
                                  <p className="text-gray-600 mb-4">Unlock complete negotiation tactics and action items</p>
                                  <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#132D54] transition-all"
                                  >
                                    <Crown size={16} />
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full content for premium users */}
                          {isPremium && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-4">Key Talking Points</h4>
                                  <ul className="space-y-2">
                                    {analysisResult.negotiationGuide?.keyTalkingPoints?.map((point, index) => (
                                      <li key={index} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="text-green-500" size={16} />
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-4">Red Flags to Watch</h4>
                                  <ul className="space-y-2">
                                    {analysisResult.negotiationGuide?.redFlags?.map((flag, index) => (
                                      <li key={index} className="flex items-center gap-2 text-sm">
                                        <AlertCircle className="text-red-500" size={16} />
                                        {flag}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">Action Items</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {analysisResult.actionItems?.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <div className="w-6 h-6 bg-[#0B1F3B]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-[#0B1F3B]">{index + 1}</span>
                                      </div>
                                      <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === "companies" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(analysisResult.companyInsights || {}).map(([type, data]) => (
                              <div key={type} className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{type}</h3>
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-sm text-gray-600">Salary Multiplier</div>
                                    <div className="text-2xl font-bold text-[#0B1F3B]">
                                      {((data.salaryMultiplier - 1) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 mb-2">Benefits</div>
                                    <ul className="space-y-1">
                                      {data.benefits?.map((benefit, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                          <CheckCircle className="text-green-500" size={14} />
                                          {benefit}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 mb-2">Risks</div>
                                    <ul className="space-y-1">
                                      {data.risks?.map((risk, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                          <AlertCircle className="text-red-500" size={14} />
                                          {risk}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Blurred section for free users */}
                          {!isPremium && (
                            <div className="relative">
                              <div className="bg-white p-6 rounded-xl border border-gray-200 blur-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Benchmarks</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Top Payers</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                          <div className="font-medium text-gray-900">Google</div>
                                          <div className="text-sm text-gray-600">Best benefits</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-green-600">+40%</div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                          <div className="font-medium text-gray-900">Microsoft</div>
                                          <div className="text-sm text-gray-600">Good work-life balance</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-green-600">+30%</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Mid-Tier Companies</h4>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center p-3 bg-[#0B1F3B]/5 rounded-lg">
                                        <div>
                                          <div className="font-medium text-gray-900">TCS</div>
                                          <div className="text-sm text-gray-600">Stable career</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-[#0B1F3B]">-5%</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center border border-[#0B1F3B]/20">
                                  <Crown className="text-[#0B1F3B] mx-auto mb-3" size={32} />
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Company Data</h4>
                                  <p className="text-gray-600 mb-4">Unlock detailed company benchmarks and insights</p>
                                  <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#132D54] transition-all"
                                  >
                                    <Crown size={16} />
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full content for premium users */}
                          {isPremium && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Benchmarks</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Top Payers</h4>
                                  <div className="space-y-3">
                                    {analysisResult.companyBenchmarks?.topPayers?.map((company, index) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div>
                                          <div className="font-medium text-gray-900">{company.company}</div>
                                          <div className="text-sm text-gray-600">{company.note}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-green-600">
                                            +{((company.multiplier - 1) * 100).toFixed(0)}%
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Mid-Tier Companies</h4>
                                  <div className="space-y-3">
                                    {analysisResult.companyBenchmarks?.midTier?.map((company, index) => (
                                      <div key={index} className="flex justify-between items-center p-3 bg-[#0B1F3B]/5 rounded-lg">
                                        <div>
                                          <div className="font-medium text-gray-900">{company.company}</div>
                                          <div className="text-sm text-gray-600">{company.note}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-[#0B1F3B]">
                                            {((company.multiplier - 1) * 100).toFixed(0)}%
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "skills" && (
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">High-Value Skills</h3>
                              <div className="px-3 py-1 bg-[#0B1F3B]/10 text-[#0B1F3B] text-xs font-medium rounded-full">
                                {formData.industry} Industry
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {analysisResult.skillAnalysis?.highValueSkills?.map((skill, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                  <div>
                                    <div className="font-medium text-gray-900">{skill.skill}</div>
                                    <div className="text-sm text-gray-600">Demand: {skill.demand}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-600">
                                      +{((skill.premium - 1) * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Salary boost</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Blurred section for free users */}
                          {!isPremium && (
                            <div className="relative">
                              <div className="bg-white p-6 rounded-xl border border-gray-200 blur-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emerging Skills</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center justify-between p-4 bg-[#0B1F3B]/5 rounded-lg border border-[#0B1F3B]/15">
                                    <div>
                                      <div className="font-medium text-gray-900">AI/ML</div>
                                      <div className="text-sm text-gray-600">Trend: Rising</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-[#0B1F3B]">+35%</div>
                                      <div className="text-xs text-gray-500">Salary boost</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-[#0B1F3B]/5 rounded-lg border border-[#0B1F3B]/15">
                                    <div>
                                      <div className="font-medium text-gray-900">DevOps</div>
                                      <div className="text-sm text-gray-600">Trend: Stable</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-[#0B1F3B]">+30%</div>
                                      <div className="text-xs text-gray-500">Salary boost</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center border border-[#0B1F3B]/20">
                                  <Crown className="text-[#0B1F3B] mx-auto mb-3" size={32} />
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Skill Analysis</h4>
                                  <p className="text-gray-600 mb-4">Unlock emerging skills and market trends</p>
                                  <Link
                                    href="/pricing"
                                    className="inline-flex items-center gap-2 bg-[#0B1F3B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#132D54] transition-all"
                                  >
                                    <Crown size={16} />
                                    Upgrade Now
                                    <ArrowRight size={16} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full content for premium users */}
                          {isPremium && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                              <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Emerging Skills</h3>
                                <div className="px-3 py-1 bg-[#0B1F3B]/10 text-[#0B1F3B] text-xs font-medium rounded-full">
                                  {formData.industry} Industry
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysisResult.skillAnalysis?.emergingSkills?.map((skill, index) => (
                                  <div key={index} className="flex items-center justify-between p-4 bg-[#0B1F3B]/5 rounded-lg border border-[#0B1F3B]/15">
                                    <div>
                                      <div className="font-medium text-gray-900">{skill.skill}</div>
                                      <div className="text-sm text-gray-600">Trend: {skill.trend}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-[#0B1F3B]">
                                        +{((skill.premium - 1) * 100).toFixed(0)}%
                                      </div>
                                      <div className="text-xs text-gray-500">Salary boost</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center"
                >
                  <div className="w-16 h-16 bg-[#0B1F3B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="text-[#0B1F3B]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze Your Salary?</h3>
                  <p className="text-gray-600 mb-6">
                    Fill in the form on the left to get comprehensive salary insights, market analysis, and negotiation strategies.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Market Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Negotiation Tips
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Company Benchmarks
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Overlay */}
      <ProgressOverlay isVisible={showProgressOverlay} type="salary" />
    </div>
  );
}