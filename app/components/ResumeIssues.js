"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
  Shield,
  XCircle,
  Sparkles,
  Users,
  Award,
  Star
} from "lucide-react";

export default function ResumeIssues() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIssue, setActiveIssue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate issues
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIssue((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const issues = [
    {
      icon: <TrendingDown className="w-7 h-7" />,
      title: "Poor ATS Compatibility",
      description: "75% of resumes never reach human eyes. They're filtered out by Applicant Tracking Systems due to incompatible formatting, missing keywords, or wrong file formats.",
      stat: "75%",
      statLabel: "Rejected by ATS",
      color: "from-slate-500 to-gray-600",
      lightColor: "from-slate-50 to-gray-50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      solution: "ATS-optimized templates designed to pass every filter"
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "Generic Templates",
      description: "Recruiters spend only 6-10 seconds on each resume. Generic designs fail to capture attention in this critical window and get passed over.",
      stat: "6-10s",
      statLabel: "Average Review Time",
      color: "from-blue-500 to-indigo-600",
      lightColor: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      solution: "Eye-catching professional designs that stand out instantly"
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Weak Content Structure",
      description: "60% of resumes lack quantifiable achievements. Poor organization and vague descriptions make even qualified candidates look mediocre.",
      stat: "60%",
      statLabel: "Missing Achievements",
      color: "from-purple-500 to-violet-600",
      lightColor: "from-purple-50 to-violet-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      solution: "AI-powered content optimization with measurable results"
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-slate-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            THE HIDDEN RESUME KILLERS
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Why Many Resumes{" "}
            <span className="bg-gradient-to-r from-slate-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Don't Get Noticed
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Most job seekers struggle with these <span className="font-bold text-slate-600">3 critical issues</span> that prevent them from landing interviews
          </p>

          {/* Problem Stats Bar - Redesigned */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto shadow-xl border border-slate-100">
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              {issues.map((issue, idx) => (
                <div 
                  key={idx}
                  className="group cursor-pointer"
                  onClick={() => setActiveIssue(idx)}
                >
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 transition-all duration-300 ${
                    activeIssue === idx ? `bg-gradient-to-r ${issue.color} bg-clip-text text-transparent scale-110` : 'text-gray-400'
                  }`}>
                    {issue.stat}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    activeIssue === idx ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {issue.statLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issues Cards - Redesigned */}
        <div className="space-y-12 lg:space-y-16 mb-20 lg:mb-24">
          {issues.map((issue, index) => (
            <div 
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                
                {/* Content Side */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* Issue Header */}
                  <div className="mb-6">
                    {/* Icon & Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${issue.iconBg} ${issue.iconColor} p-3 rounded-xl shadow-sm`}>
                        {issue.icon}
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        Problem #{index + 1}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {issue.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Problem & Solution Cards - Side by Side */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Problem Card */}
                    <div className={`bg-gradient-to-br ${issue.lightColor} border-2 border-slate-200 rounded-xl p-5`}>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-slate-600" />
                        <span className="text-slate-800 font-bold text-sm">The Problem</span>
                      </div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${issue.color} bg-clip-text text-transparent mb-1`}>
                        {issue.stat}
                      </div>
                      <div className="text-slate-700 font-medium text-sm">{issue.statLabel}</div>
                    </div>

                    {/* Solution Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 font-bold text-sm">Our Solution</span>
                      </div>
                      <p className="text-blue-700 font-medium text-sm leading-snug">{issue.solution}</p>
                    </div>
                  </div>
                </div>

                {/* Visual Side - Enhanced Animation */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative group">
                    {/* Glow Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${issue.color} opacity-20 rounded-3xl blur-3xl transform scale-105 group-hover:opacity-30 transition-all duration-500`}></div>
                    
                    {/* Visual Container */}
                    <div className="relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                      {/* Score Card Visual */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-4">
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="font-bold text-gray-900">Resume Analysis</h4>
                          <div className={`px-3 py-1 bg-gradient-to-r ${issue.color} text-white rounded-full text-xs font-bold`}>
                            Poor Score
                          </div>
                        </div>
                        
                        {/* Progress Bars */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600 font-medium">{issue.title}</span>
                              <span className={`text-sm font-bold bg-gradient-to-r ${issue.color} bg-clip-text text-transparent`}>
                                {issue.stat}
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${issue.color} rounded-full transition-all duration-1000`}
                                style={{ width: index === 0 ? '45%' : index === 1 ? '35%' : '40%' }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600 font-medium">Overall Quality</span>
                              <span className="text-sm font-bold text-orange-500">52%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="w-1/2 h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Warning Message */}
                      <div className={`bg-gradient-to-r ${issue.lightColor} border border-slate-200 rounded-xl p-4 flex items-start gap-3`}>
                        <AlertCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm font-medium leading-snug">
                          Your resume needs immediate attention to improve your chances of getting noticed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solution Section - "How ExpertResume Helps You Win" */}
        <div className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl overflow-hidden border border-blue-100 shadow-xl">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl"></div>
            </div>

            <div className="relative px-6 py-12 lg:px-12 lg:py-16">
              {/* Header */}
              <div className="text-center mb-12 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full text-sm font-semibold text-blue-700 mb-4">
                  <Sparkles className="w-4 h-4" />
                  Your Solution is Here
                </div>
                
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  How <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ExpertResume</span> Helps You Win
                </h3>
                
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  We've built a simple, powerful platform that takes the stress out of resume building and helps you land interviews faster
                </p>
              </div>
              
              {/* Solutions Grid - Enhanced Design */}
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12 max-w-6xl mx-auto">
                {[
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Pass Every ATS Filter",
                    description: "Stop getting auto-rejected. Our AI checks your resume against real ATS systems and fixes issues instantly.",
                    benefit: "75% of resumes fail ATS - yours won't",
                    color: "from-blue-500 to-cyan-600",
                    lightColor: "from-blue-50 to-cyan-50",
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600"
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Catch Recruiters' Eyes",
                    description: "Get a professional design that stands out in those critical 6-10 seconds when recruiters review your resume.",
                    benefit: "50+ proven templates that get results",
                    color: "from-indigo-500 to-purple-600",
                    lightColor: "from-indigo-50 to-purple-50",
                    iconBg: "bg-indigo-100",
                    iconColor: "text-indigo-600"
                  },
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Get 3x More Callbacks",
                    description: "AI-optimized content with quantifiable achievements that make recruiters want to call you immediately.",
                    benefit: "Join 100k+ who got their dream job",
                    color: "from-purple-500 to-pink-600",
                    lightColor: "from-purple-50 to-pink-50",
                    iconBg: "bg-purple-100",
                    iconColor: "text-purple-600"
                  }
                ].map((solution, idx) => (
                  <div key={idx} className="group">
                    <div className="relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      {/* Icon */}
                      <div className={`${solution.iconBg} ${solution.iconColor} p-3 rounded-xl shadow-sm mb-4 inline-flex`}>
                        {solution.icon}
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">
                        {solution.title}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                        {solution.description}
                      </p>
                      
                      {/* Benefit Badge */}
                      <div className={`bg-gradient-to-r ${solution.lightColor} border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 flex items-start gap-2`}>
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{solution.benefit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Success Proof - Redesigned */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 mb-10 max-w-5xl mx-auto border border-blue-200 shadow-lg">
                <div className="text-center mb-6">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Trusted by Job Seekers Worldwide</h4>
                  <p className="text-gray-600">Real results from real people</p>
                </div>
                <div className="grid grid-cols-3 gap-6 lg:gap-8 text-center">
                  <div className="group">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">100k+</div>
                    </div>
                    <div className="text-gray-700 font-medium text-sm">Resumes Created</div>
                  </div>
                  <div className="group">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Award className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">50+</div>
                    </div>
                    <div className="text-gray-700 font-medium text-sm">Templates</div>
                  </div>
                  <div className="group">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">4.9★</div>
                    </div>
                    <div className="text-gray-700 font-medium text-sm">User Rating</div>
                  </div>
                </div>
              </div>
              
              {/* CTA Section - Clean & Direct */}
              <div className="text-center max-w-2xl mx-auto">
                <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  Ready to get more interviews?
                </h4>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  Create your professional resume in minutes - completely free to start
                </p>
                
                <Link
                  href="/resume-builder"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6 group"
                >
                  Start Building For Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>No credit card needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Ready in 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Your data is safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
