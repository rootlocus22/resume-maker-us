"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Target, Briefcase, Palette, Shield, User, X, TrendingUp, Award, Zap } from "lucide-react";
import Link from "next/link";

export default function TemplateDiscovery({ templates, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    experience: "",
    industry: "",
    style: "",
    goal: "",
    timeframe: ""
  });
  const [recommendations, setRecommendations] = useState(null);
  const [showEducation, setShowEducation] = useState(false);

  const questions = [
    {
      id: "experience",
      icon: Target,
      title: "What's your experience level?",
      subtitle: "This helps us recommend the right template structure",
      education: "Entry-level candidates should emphasize education and skills, while experienced professionals should lead with achievements.",
      options: [
        { 
          value: "entry", 
          label: "Entry-Level / Recent Graduate", 
          emoji: "🌱",
          description: "Fresh start, building your career",
          templateHint: "We'll show templates that highlight education & potential"
        },
        { 
          value: "mid", 
          label: "Mid-Career Professional", 
          emoji: "📊",
          description: "3-8 years of solid experience",
          templateHint: "Templates that balance experience & achievements"
        },
        { 
          value: "senior", 
          label: "Senior / Leadership", 
          emoji: "👔",
          description: "9+ years, leading teams or projects",
          templateHint: "Executive templates emphasizing leadership impact"
        },
        { 
          value: "executive", 
          label: "C-Level / Executive", 
          emoji: "🏆",
          description: "Executive leadership roles",
          templateHint: "Premium executive templates with strategic focus"
        }
      ]
    },
    {
      id: "industry",
      icon: Briefcase,
      title: "Which industry best describes your field?",
      subtitle: "Different industries have different expectations",
      education: "Traditional industries prefer conservative designs, while creative fields allow more personality.",
      options: [
        { 
          value: "tech", 
          label: "Technology & IT", 
          emoji: "💻",
          description: "Software, engineering, data science",
          templateHint: "Modern, clean templates with technical focus"
        },
        { 
          value: "business", 
          label: "Business & Finance", 
          emoji: "💼",
          description: "Finance, consulting, management",
          templateHint: "Professional templates with conservative design"
        },
        { 
          value: "creative", 
          label: "Creative & Design", 
          emoji: "🎨",
          description: "Design, marketing, media",
          templateHint: "Creative templates that showcase personality"
        },
        { 
          value: "healthcare", 
          label: "Healthcare & Medical", 
          emoji: "🏥",
          description: "Medical, nursing, healthcare",
          templateHint: "Clean, trustworthy professional templates"
        },
        { 
          value: "education", 
          label: "Education & Academia", 
          emoji: "📚",
          description: "Teaching, research, education",
          templateHint: "Academic templates with publication focus"
        },
        { 
          value: "other", 
          label: "Other / General", 
          emoji: "🌐",
          description: "Everything else",
          templateHint: "Versatile templates for any field"
        }
      ]
    },
    {
      id: "style",
      icon: Palette,
      title: "What design style appeals to you?",
      subtitle: "Your resume should reflect your personality",
      education: "Your template style should match your industry norms while standing out enough to be memorable.",
      options: [
        { 
          value: "modern", 
          label: "Modern & Bold", 
          emoji: "✨",
          description: "Stand out with contemporary design",
          templateHint: "Eye-catching templates with modern elements"
        },
        { 
          value: "professional", 
          label: "Professional & Traditional", 
          emoji: "💼",
          description: "Classic, trusted, time-tested",
          templateHint: "Traditional templates that work everywhere"
        },
        { 
          value: "minimal", 
          label: "Minimal & Clean", 
          emoji: "⚡",
          description: "Less is more, focus on content",
          templateHint: "Minimal templates emphasizing your achievements"
        },
        { 
          value: "creative", 
          label: "Creative & Unique", 
          emoji: "🎨",
          description: "Show your creative side",
          templateHint: "Unique templates that express creativity"
        }
      ]
    },
    {
      id: "goal",
      icon: TrendingUp,
      title: "What's your primary goal?",
      subtitle: "Let's optimize for what matters most to you",
      education: "Your goal determines template priorities - ATS optimization for applications, or visual impact for networking.",
      options: [
        { 
          value: "ats", 
          label: "Pass ATS Systems", 
          emoji: "🛡️",
          description: "Applying to large companies online",
          templateHint: "ATS-optimized templates with high scan rates"
        },
        { 
          value: "impression", 
          label: "Make Strong First Impression", 
          emoji: "⭐",
          description: "Wow recruiters & hiring managers",
          templateHint: "Visually striking templates that stand out"
        },
        { 
          value: "versatile", 
          label: "Work for Any Situation", 
          emoji: "🎯",
          description: "One resume for all purposes",
          templateHint: "Balanced templates good for everything"
        },
        { 
          value: "promotion", 
          label: "Internal Promotion", 
          emoji: "📈",
          description: "Moving up in current company",
          templateHint: "Professional templates highlighting growth"
        }
      ]
    },
    {
      id: "timeframe",
      icon: Award,
      title: "When do you need your resume?",
      subtitle: "This helps us prioritize the right features",
      education: "Quick applications benefit from templates that are easy to fill. Career overhauls allow more customization time.",
      options: [
        { 
          value: "urgent", 
          label: "ASAP (Today/Tomorrow)", 
          emoji: "⚡",
          description: "Need to apply right away",
          templateHint: "Quick-start templates, easy to complete"
        },
        { 
          value: "soon", 
          label: "This Week", 
          emoji: "📅",
          description: "Actively applying soon",
          templateHint: "Templates with good guidance & structure"
        },
        { 
          value: "planning", 
          label: "Planning Ahead", 
          emoji: "🎯",
          description: "Preparing for future search",
          templateHint: "Premium templates worth customizing"
        },
        { 
          value: "updating", 
          label: "Just Updating", 
          emoji: "🔄",
          description: "Refreshing existing resume",
          templateHint: "Modern updates to classic styles"
        }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canGoNext = answers[currentQuestion?.id];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    setShowEducation(false);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Calculate recommendations
      const scored = scoreTemplates(templates, answers);
      setRecommendations(scored);
    } else {
      setCurrentStep(prev => prev + 1);
      setShowEducation(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowEducation(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({
      experience: "",
      industry: "",
      style: "",
      goal: "",
      timeframe: ""
    });
    setRecommendations(null);
    setShowEducation(false);
  };

  // Enhanced smart template scoring algorithm with better metadata matching
  const scoreTemplates = (allTemplates, userAnswers) => {
    const scored = allTemplates.map(template => {
      let score = 0;
      let reasons = [];
      const templateName = (template.name || '').toLowerCase();
      const templateCategory = (template.category || '').toLowerCase();
      const templateTags = (template.tags || []).map(t => t.toLowerCase());
      const templateKeywords = (template.keywords || []).map(k => k.toLowerCase());
      const allMetadata = [templateName, templateCategory, ...templateTags, ...templateKeywords].join(' ');

      // Experience Level Scoring (35 points)
      if (userAnswers.experience === 'entry') {
        if (allMetadata.includes('fresher') || allMetadata.includes('entry') || 
            allMetadata.includes('graduate') || allMetadata.includes('student') ||
            allMetadata.includes('minimal') || templateCategory.includes('minimal')) {
          score += 35;
          reasons.push('Perfect for entry-level professionals');
        } else if (allMetadata.includes('professional') || allMetadata.includes('modern')) {
          score += 20;
          reasons.push('Clean professional design for beginners');
        }
      } else if (userAnswers.experience === 'mid') {
        if (allMetadata.includes('professional') || allMetadata.includes('modern') ||
            allMetadata.includes('ats') || templateCategory.includes('professional')) {
          score += 35;
          reasons.push('Ideal for mid-career professionals');
        } else if (allMetadata.includes('executive') || allMetadata.includes('senior')) {
          score += 15;
          reasons.push('Professional template with growth potential');
        }
      } else if (userAnswers.experience === 'senior') {
        if (allMetadata.includes('executive') || allMetadata.includes('senior') ||
            allMetadata.includes('leadership') || templateCategory.includes('executive')) {
          score += 35;
          reasons.push('Executive-level design for senior roles');
        } else if (allMetadata.includes('professional') || allMetadata.includes('modern')) {
          score += 25;
          reasons.push('Professional design for experienced candidates');
        }
      } else if (userAnswers.experience === 'executive') {
        if (allMetadata.includes('executive') || allMetadata.includes('c-level') ||
            allMetadata.includes('premium') || templateCategory.includes('executive')) {
          score += 35;
          reasons.push('Premium executive template');
        } else if (allMetadata.includes('professional') || allMetadata.includes('leadership')) {
          score += 20;
          reasons.push('Professional template for leadership roles');
        }
      }

      // Industry Matching (30 points)
      if (userAnswers.industry === 'tech') {
        if (allMetadata.includes('tech') || allMetadata.includes('software') ||
            allMetadata.includes('engineer') || allMetadata.includes('it') ||
            allMetadata.includes('modern') || allMetadata.includes('developer')) {
          score += 30;
          reasons.push('Optimized for tech industry');
        } else if (allMetadata.includes('professional') || allMetadata.includes('ats')) {
          score += 15;
          reasons.push('Professional design for tech roles');
        }
      } else if (userAnswers.industry === 'business') {
        if (allMetadata.includes('business') || allMetadata.includes('finance') ||
            allMetadata.includes('consulting') || allMetadata.includes('executive') ||
            allMetadata.includes('professional') || allMetadata.includes('classic')) {
          score += 30;
          reasons.push('Perfect for business professionals');
        }
      } else if (userAnswers.industry === 'creative') {
        if (allMetadata.includes('creative') || allMetadata.includes('design') ||
            allMetadata.includes('visual') || allMetadata.includes('portfolio') ||
            allMetadata.includes('infographic') || templateCategory.includes('creative')) {
          score += 30;
          reasons.push('Creative design that stands out');
        } else if (allMetadata.includes('modern') || allMetadata.includes('colorful')) {
          score += 20;
          reasons.push('Modern design with creative flair');
        }
      } else if (userAnswers.industry === 'healthcare') {
        if (allMetadata.includes('healthcare') || allMetadata.includes('medical') ||
            allMetadata.includes('professional') || allMetadata.includes('ats') ||
            allMetadata.includes('clean') || allMetadata.includes('classic')) {
          score += 30;
          reasons.push('Professional healthcare template');
        }
      } else if (userAnswers.industry === 'education') {
        if (allMetadata.includes('education') || allMetadata.includes('academic') ||
            allMetadata.includes('teacher') || allMetadata.includes('professional') ||
            allMetadata.includes('classic')) {
          score += 30;
          reasons.push('Ideal for education sector');
        }
      }

      // Style Preference (20 points)
      if (userAnswers.style === 'modern') {
        if (allMetadata.includes('modern') || allMetadata.includes('contemporary') ||
            allMetadata.includes('sleek') || allMetadata.includes('visual')) {
          score += 20;
          reasons.push('Modern and contemporary design');
        }
      } else if (userAnswers.style === 'professional') {
        if (allMetadata.includes('professional') || allMetadata.includes('classic') ||
            allMetadata.includes('executive') || allMetadata.includes('ats')) {
          score += 20;
          reasons.push('Professional and polished');
        }
      } else if (userAnswers.style === 'minimal') {
        if (allMetadata.includes('minimal') || allMetadata.includes('clean') ||
            allMetadata.includes('simple') || allMetadata.includes('classic')) {
          score += 20;
          reasons.push('Clean minimal design');
        }
      } else if (userAnswers.style === 'creative') {
        if (allMetadata.includes('creative') || allMetadata.includes('unique') ||
            allMetadata.includes('visual') || allMetadata.includes('colorful')) {
          score += 20;
          reasons.push('Creative and eye-catching');
        }
      }

      // Goal Alignment (15 points)
      if (userAnswers.goal === 'ats') {
        if (allMetadata.includes('ats') || allMetadata.includes('optimized') ||
            allMetadata.includes('professional') || allMetadata.includes('classic')) {
          score += 15;
          reasons.push('ATS-optimized for applicant tracking systems');
        }
      } else if (userAnswers.goal === 'impression') {
        if (allMetadata.includes('visual') || allMetadata.includes('creative') ||
            allMetadata.includes('executive') || allMetadata.includes('premium') ||
            allMetadata.includes('modern')) {
          score += 15;
          reasons.push('Visually impressive design');
        }
      } else if (userAnswers.goal === 'versatile') {
        if (allMetadata.includes('professional') || allMetadata.includes('versatile') ||
            allMetadata.includes('modern') || allMetadata.includes('ats')) {
          score += 15;
          reasons.push('Versatile for any application');
        }
      } else if (userAnswers.goal === 'promotion') {
        if (allMetadata.includes('executive') || allMetadata.includes('professional') ||
            allMetadata.includes('leadership') || allMetadata.includes('senior')) {
          score += 15;
          reasons.push('Perfect for career advancement');
        }
      }

      // Timeframe Consideration (10 points)
      if (userAnswers.timeframe === 'urgent') {
        if (!template.premium || allMetadata.includes('simple') || allMetadata.includes('minimal')) {
          score += 10;
          reasons.push('Quick to complete and customize');
        }
      } else if (userAnswers.timeframe === 'planning') {
        if (template.premium || allMetadata.includes('premium') || allMetadata.includes('executive')) {
          score += 10;
          reasons.push('Premium quality worth the investment');
        }
      }

      // Bonus: ATS Score (10 points)
      if (template.atsScore && template.atsScore >= 90) {
        score += 10;
        reasons.push(`High ATS score: ${template.atsScore}/100`);
      } else if (template.atsScore && template.atsScore >= 80) {
        score += 5;
      }

      // Bonus: Popular templates (5 points)
      if (template.popular || allMetadata.includes('popular') || allMetadata.includes('trending')) {
        score += 5;
        reasons.push('Popular among job seekers');
      }

      // Add default reason if no specific reasons
      if (reasons.length === 0) {
        reasons.push('Versatile professional template');
      }

      // Calculate match percentage (more realistic)
      const maxPossibleScore = 125; // 35 + 30 + 20 + 15 + 10 + 10 + 5
      const matchPercentage = Math.min(Math.round((score / maxPossibleScore) * 100), 98);

      return {
        ...template,
        score,
        reasons: reasons.slice(0, 3), // Top 3 reasons
        matchPercentage
      };
    });

    // Sort by score and return top 6 (increased from 5 for better variety)
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  const getBuilderUrl = (templateId) => {
    return `/resume-builder?template=${templateId}`;
  };

  // Results view
  if (recommendations) {
    const selectedOption = currentQuestion?.options.find(opt => opt.value === answers[currentQuestion?.id]);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto py-4">
        <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center px-3 sm:px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full my-auto relative animate-fadeIn">
          {onClose && (
            <button
              onClick={onClose}
              className="sticky top-3 right-3 float-right p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 bg-white shadow-sm m-3"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="clear-both"></div>
          
          <div className="p-5 sm:p-6 pt-2">
            {/* Success Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-3 shadow-lg">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 px-2">
                Your Perfect Templates!
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto px-4">
                Based on your profile, we've found the <span className="font-semibold text-blue-600">top {recommendations.length} templates</span> that perfectly match your needs. Each one is optimized for your success!
              </p>
            </div>

            {/* Your Profile Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 mb-4">
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900">📋 Your Profile Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                {Object.entries(answers).map(([key, value]) => {
                  const question = questions.find(q => q.id === key);
                  const option = question?.options.find(o => o.value === value);
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl mb-1">{option?.emoji}</div>
                      <div className="text-xs text-gray-600 font-medium capitalize">{key}</div>
                      <div className="text-xs text-gray-800 font-semibold">{option?.label.split(' / ')[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-5">
              {recommendations.map((template, index) => (
                <div
                  key={template.id}
                  className={`relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${
                    index === 0 ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-1.5 text-xs font-bold z-10">
                      🏆 BEST • {template.matchPercentage}%
                    </div>
                  )}
                  
                  {index > 0 && (
                    <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-bold text-gray-700 z-10">
                      #{index + 1}
                    </div>
                  )}
                  
                  <div className={index === 0 ? 'pt-8' : 'pt-2'}>
                    {/* Template Preview */}
                    <div className="px-2">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-2 relative group-hover:scale-105 transition-transform duration-300">
                        {template.previewImage ? (
                          <img
                            src={template.previewImage}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="text-3xl mb-2">📄</div>
                              <div className="text-xs">Preview</div>
                            </div>
                          </div>
                        )}
                        {template.premium && (
                          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Pro
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="px-2 pb-2">
                      <div className="mb-1.5">
                        <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {template.category}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-1.5 line-clamp-2">
                        {template.name}
                      </h3>
                      
                      {/* Why This Template */}
                      <div className="space-y-0.5 mb-2">
                        {template.reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-start text-xs text-gray-600">
                            <CheckCircle className="w-2.5 h-2.5 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link href={getBuilderUrl(template.id)}>
                        <button className={`w-full px-2 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                          index === 0
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-md'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}>
                          {index === 0 ? 'Use' : 'Select'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Why These Templates Section */}
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4">
              <h3 className="font-bold text-sm sm:text-base mb-2 text-gray-900">💡 Why These Templates?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5 text-xs sm:text-sm">Experience-Matched</div>
                    <div className="text-xs">These templates highlight the right content for your {answers.experience} level</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5 text-xs sm:text-sm">Industry-Appropriate</div>
                    <div className="text-xs">Professional standards for {answers.industry} industry expectations</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5 text-xs sm:text-sm">Goal-Optimized</div>
                    <div className="text-xs">
                      {answers.goal === 'ats' && 'Optimized to pass ATS systems and reach human reviewers'}
                      {answers.goal === 'impression' && 'Designed to make memorable first impressions'}
                      {answers.goal === 'versatile' && 'Versatile enough for any application'}
                      {answers.goal === 'promotion' && 'Professional format perfect for internal moves'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-cyan-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5 text-xs sm:text-sm">Timeline-Ready</div>
                    <div className="text-xs">
                      {answers.timeframe === 'urgent' && 'Quick-start templates you can complete today'}
                      {answers.timeframe === 'soon' && 'Well-structured with helpful guidance'}
                      {answers.timeframe === 'planning' && 'Premium quality worth investing time in'}
                      {answers.timeframe === 'updating' && 'Easy to update your existing content'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center pt-4 border-t">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Start Over
              </button>
              <Link href="/templates" className="w-full sm:w-auto">
                <button className="w-full px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm">
                  Browse All Templates
                </button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Quiz view
  const selectedOption = currentQuestion?.options.find(opt => opt.value === answers[currentQuestion?.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto py-4">
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center px-3 sm:px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full relative my-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="sticky top-3 right-3 float-right p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20 bg-white shadow-sm m-3"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        <div className="clear-both"></div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-t-2xl overflow-hidden -mt-2">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="font-medium">Question {currentStep + 1} of {questions.length}</span>
              <div className="flex gap-1 ml-auto">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx <= currentStep ? 'bg-blue-600 w-3' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              {currentQuestion && (
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <currentQuestion.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {currentQuestion?.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentQuestion?.subtitle}
                </p>
              </div>
            </div>

            {/* Educational Tip */}
            {currentQuestion?.education && (
              <button
                onClick={() => setShowEducation(!showEducation)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {showEducation ? 'Hide tip' : 'Why does this matter?'}
              </button>
            )}
            
            {showEducation && (
              <div className="mt-2 bg-blue-50 border-l-3 border-blue-600 p-3 rounded-r-lg animate-slideDown">
                <div className="flex gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900">
                    <span className="font-semibold">Pro Tip: </span>
                    {currentQuestion.education}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2 mb-5">
            {currentQuestion?.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`w-full p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all duration-300 group ${
                    isSelected
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl sm:text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {option.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm sm:text-base text-gray-900 mb-0.5 flex items-center gap-2">
                        {option.label}
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-600">
                        {option.description}
                      </p>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="flex items-start gap-1.5 text-xs text-blue-700">
                            <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{option.templateHint}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                canGoNext
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Find My Perfect Templates</span>
                  <span className="xs:hidden">Find Templates</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Next Question</span>
                  <span className="xs:hidden">Next</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        /* Smooth scrolling for mobile */
        @supports (-webkit-touch-callout: none) {
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Mobile optimization */
        @media (max-width: 640px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
}

