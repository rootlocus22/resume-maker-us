'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, RefreshCw, FileText, Upload, Edit, Target, BarChart2, Award, Users, TrendingUp, AlertCircle, CheckSquare, Square, Star, Clock, BookOpen, UserCheck, Zap } from 'lucide-react';

export default function ModernAnalysisDisplay({ result, onReset, isPremium, isBasicPlan, enterpriseMode = false, hasEnterpriseAccess = false, onUpgradeClick }) {
  const [currentSection, setCurrentSection] = useState('Executive Summary');
  const [matchRate, setMatchRate] = useState(result?.overallScore || 75);

  // Auto-select Executive Summary when result changes
  useEffect(() => {
    if (result) {
      setCurrentSection('Executive Summary');
      // Update match rate when result changes
      setMatchRate(result?.overallScore || 75);
      
      // Debug logging for analysisType
      console.log('🔍 UI ANALYSIS TYPE DEBUG:');
      console.log('- Received result:', result);
      console.log('- analysisType:', result?.analysisType);
      console.log('- analysisType.toUpperCase():', result?.analysisType?.toUpperCase());
      console.log('- Is COMPARATIVE?', result?.analysisType?.toUpperCase() === 'COMPARATIVE');
      console.log('- Is GENERAL?', result?.analysisType?.toUpperCase() === 'GENERAL');
    }
  }, [result]);

  // Helper function to safely render text content
  const renderTextContent = (content) => {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'object' && content !== null) {
      if (content.message) return content.message;
      if (content.suggestion) return content.suggestion;
      if (content.text) return content.text;
      if (content.keyword) return content.keyword; // Handle keyword objects
      if (content.recommendation) return content.recommendation; // Handle recommendation objects
      return JSON.stringify(content);
    }
    return String(content);
  };

  // Helper function to render actionable recommendations
  const renderActionableRecommendations = (recommendations) => {
    if (!Array.isArray(recommendations)) return null;
    
    return recommendations.map((rec, index) => (
      <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <Award className="text-gray-500 mt-1 sm:w-4 sm:h-4" size={14} />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">{renderTextContent(rec.area)}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                rec.priority?.toLowerCase() === 'high' 
                  ? 'bg-red-100 text-red-700' 
                  : rec.priority?.toLowerCase() === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {rec.priority || 'Medium'} Priority
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">{renderTextContent(rec.recommendation)}</p>
          </div>
        </div>
      </div>
    ));
  };

  // Helper function to render array items
  const renderArrayItems = (items, maxItems = 8, color = 'green') => {
    if (!Array.isArray(items)) return null;
    
    const colorClasses = {
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      blue: 'bg-slate-100 text-primary',
      yellow: 'bg-yellow-100 text-yellow-700'
    };
    
    return items.slice(0, maxItems).map((item, index) => (
      <span key={index} className={`${colorClasses[color]} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs`}>
        {renderTextContent(item)}
      </span>
    ));
  };

  // Helper function to render suggestions
  const renderSuggestions = (suggestions, maxItems = 5) => {
    if (!Array.isArray(suggestions)) return null;
    
    return suggestions.slice(0, maxItems).map((suggestion, index) => (
      <li key={index} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
        <div className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0"></div>
        {renderTextContent(suggestion)}
      </li>
    ));
  };

  // Helper function to render issues
  const renderIssues = (issues) => {
    if (!Array.isArray(issues)) return null;
    
    return issues.map((issue, index) => (
      <li key={index} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
        <XCircle className="text-red-500 mt-0.5 sm:w-3 sm:h-3" size={10} />
        {renderTextContent(issue)}
      </li>
    ));
  };

  // Calculate issues count for each category
  const calculateIssuesCount = (categoryKey, data) => {
    if (!data) return 0;
    
    let count = 0;
    
    // Count missing items
    if (data.missingKeywords) count += data.missingKeywords.length;
    if (data.missingSkills) count += data.missingSkills.length;
    if (data.missingVerbs) count += data.missingVerbs.length;
    if (data.missingMetrics) count += data.missingMetrics.length;
    
    // Count issues
    if (data.issues) count += data.issues.length;
    if (data.errors) count += data.errors.length;
    if (data.formattingIssues) count += data.formattingIssues.length;
    if (data.repeatedWords) count += data.repeatedWords.length;
    
    // Count suggestions (as potential improvements)
    if (data.specificSuggestions) count += data.specificSuggestions.length;
    
    return count;
  };

  // Calculate score for analysis categories
  const calculateCategoryScore = (categoryKey, data) => {
    if (!data) return 0; // No default score - only use actual data
    
    let score = 100; // Start with perfect score
    
    // Deduct points for missing items
    const missingItems = (data.missingKeywords?.length || 0) + 
                        (data.missingSkills?.length || 0) + 
                        (data.missingVerbs?.length || 0) + 
                        (data.missingMetrics?.length || 0);
    
    // Deduct points for issues
    const issues = (data.issues?.length || 0) + 
                   (data.errors?.length || 0) + 
                   (data.formattingIssues?.length || 0);
    
    // Deduct points for repeated words
    const repeatedWords = data.repeatedWords?.length || 0;
    
    // Calculate deductions
    const totalProblems = missingItems + issues + repeatedWords;
    
    // Deduct 5 points per problem, but don't go below 20
    score = Math.max(20, score - (totalProblems * 5));
    
    return Math.round(score);
  };

  // Get all available categories from the API response
  const getAvailableCategories = () => {
    const categories = [];
    
    // Add Executive Summary only if we have analysis data (always available)
    if (result?.executiveSummary || result?.overallScore) {
      categories.push({
        key: 'executiveSummary',
        name: 'Executive Summary',
        icon: Star,
        color: 'blue',
        type: 'summary',
        score: result?.overallScore || 0,
        isPremium: false // Executive Summary is always available
      });
    }

    // Only add detailed analysis categories that have actual data
    if (result?.detailedAnalysis) {
      // Check for keyword analysis (new Gemini structure)
      if (result.detailedAnalysis.keywordAnalysis) {
        const data = result.detailedAnalysis.keywordAnalysis;
        const issuesCount = (data.missingKeywords?.length || 0);
        const score = issuesCount > 0 ? Math.max(60, 100 - (issuesCount * 10)) : 90;
        categories.push({
          key: 'keywordAnalysis',
          name: 'Keyword Analysis',
          icon: Target,
          color: 'blue',
          type: 'analysis',
          issuesCount,
          hasIssues: issuesCount > 0,
          score: score,
          isPremium: true // Requires premium
        });
      }

      // Check for skills analysis (new Gemini structure)
      if (result.detailedAnalysis.skillsAnalysis) {
        const data = result.detailedAnalysis.skillsAnalysis;
        
        // Hard Skills
        if (data.hardSkills) {
          const issuesCount = (data.hardSkills.missing?.length || 0);
          const score = issuesCount > 0 ? Math.max(60, 100 - (issuesCount * 5)) : 90;
          categories.push({
            key: 'hardSkills',
            name: 'Hard Skills',
            icon: Zap,
            color: 'green',
            type: 'analysis',
            issuesCount,
            hasIssues: issuesCount > 0,
            score: score,
            isPremium: true // Requires premium
          });
        }
        
        // Soft Skills
        if (data.softSkills) {
          const issuesCount = (data.softSkills.suggested?.length || 0);
          const score = issuesCount > 0 ? Math.max(70, 100 - (issuesCount * 5)) : 90;
          categories.push({
            key: 'softSkills',
            name: 'Soft Skills',
            icon: Users,
            color: 'purple',
            type: 'analysis',
            issuesCount,
            hasIssues: issuesCount > 0,
            score: score,
            isPremium: true // Requires premium
          });
        }
      }

      // Check for experience match (new Gemini structure)
      if (result.detailedAnalysis.experienceMatch) {
        const data = result.detailedAnalysis.experienceMatch;
        
        // Seniority Alignment
        if (data.seniorityAlignment) {
          const issuesCount = data.seniorityAlignment.isAligned ? 0 : 1;
          const score = data.seniorityAlignment.isAligned ? 90 : 60;
          categories.push({
            key: 'seniorityAlignment',
            name: 'Seniority Alignment',
            icon: TrendingUp,
            color: 'orange',
            type: 'analysis',
            issuesCount,
            hasIssues: issuesCount > 0,
            score: score,
            isPremium: true // Requires premium
          });
        }
        
        // Education Match
        if (data.educationMatch) {
          const issuesCount = data.educationMatch.meetsRequirements ? 0 : 1;
          const score = data.educationMatch.meetsRequirements ? 90 : 60;
          categories.push({
            key: 'educationMatch',
            name: 'Education Match',
            icon: BookOpen,
            color: 'indigo',
            type: 'analysis',
            issuesCount,
            hasIssues: issuesCount > 0,
            score: score,
            isPremium: true // Requires premium
          });
        }
      }

      // Check for formatting and structure (new Gemini structure)
      if (result.detailedAnalysis.formattingAndStructure) {
        const data = result.detailedAnalysis.formattingAndStructure;
        const issuesCount = (data.issues?.length || 0) + 
                           (data.repetitiveWords?.length || 0) + 
                           (data.quantificationIssues?.length || 0) + 
                           (data.spellingGrammarIssues?.length || 0);
        
        // Calculate score based on all formatting factors
        let score = 100;
        if (data.parsingRisk === 'High') score -= 30;
        else if (data.parsingRisk === 'Medium') score -= 15;
        
        // Deduct points for issues
        score -= (data.issues?.length || 0) * 5;
        score -= (data.repetitiveWords?.length || 0) * 3;
        score -= (data.quantificationIssues?.length || 0) * 4;
        score -= (data.spellingGrammarIssues?.length || 0) * 8;
        
        score = Math.max(20, score); // Don't go below 20
        
        categories.push({
          key: 'formattingAndStructure',
          name: 'Formatting & Structure',
          icon: FileText,
          color: 'gray',
          type: 'analysis',
          issuesCount,
          hasIssues: issuesCount > 0,
          score: Math.round(score),
          isPremium: true // Requires premium
        });
      }
    }

    // Add actionable recommendations only if they exist
    if (result?.actionableRecommendations?.length > 0) {
      const recommendations = result.actionableRecommendations;
      const highPriorityCount = recommendations.filter(rec => rec.priority?.toLowerCase() === 'high').length;
      const score = highPriorityCount > 0 ? Math.max(60, 100 - (highPriorityCount * 10)) : 80; // Calculate based on priority
      categories.push({
        key: 'actionableRecommendations',
        name: 'Actionable Recommendations',
        icon: Award,
        color: 'blue',
        type: 'recommendations',
        count: recommendations.length,
        issuesCount: recommendations.length,
        hasIssues: true,
        score: score,
        isPremium: true // Requires premium
      });
    }

    return categories;
  };

  const categories = getAvailableCategories();

  const getCategoryColor = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-primary',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      indigo: 'bg-accent',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      teal: 'bg-accent',
      emerald: 'bg-accent-600',
      cyan: 'bg-cyan-500',
      amber: 'bg-amber-500',
      gray: 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const renderExecutiveSummary = () => (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall ATS Score</h3>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {result?.overallScore || 0}%
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={getScoreColor(result?.overallScore || 0)}
                  strokeWidth="8"
                  strokeDasharray={`${((result?.overallScore || 0) / 100) * 339.292} 339.292`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>



      {/* Executive Summary Content */}
      {result?.executiveSummary && (
        <div className="space-y-4">
          {/* Overall Fit */}
          {result.executiveSummary.overallFit && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Overall Fit</h4>
              <p className="text-sm text-gray-700">{renderTextContent(result.executiveSummary.overallFit)}</p>
            </div>
          )}

          {/* Key Strengths */}
          {result.executiveSummary.keyStrengths && result.executiveSummary.keyStrengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="text-green-600 mt-1" size={16} />
                <h4 className="font-medium text-green-900">Key Strengths</h4>
              </div>
              <ul className="space-y-1">
                {result.executiveSummary.keyStrengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    {renderTextContent(strength)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary Areas for Improvement */}
          {result.executiveSummary.primaryAreasForImprovement && result.executiveSummary.primaryAreasForImprovement.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <XCircle className="text-red-600 mt-1" size={16} />
                <h4 className="font-medium text-red-900">Primary Areas for Improvement</h4>
              </div>
              <ul className="space-y-1">
                {result.executiveSummary.primaryAreasForImprovement.map((area, index) => (
                  <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    {renderTextContent(area)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actionable Recommendations */}
      {result?.actionableRecommendations && result.actionableRecommendations.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Award className="text-primary mt-1" size={16} />
            <h4 className="font-medium text-primary">Actionable Recommendations</h4>
          </div>
          <div className="space-y-3">
            {renderActionableRecommendations(result.actionableRecommendations)}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailedAnalysis = (categoryKey) => {
    // Get the correct data based on the category key
    let data = null;
    
    if (categoryKey === 'keywordAnalysis') {
      data = result?.detailedAnalysis?.keywordAnalysis;
    } else if (categoryKey === 'hardSkills') {
      data = result?.detailedAnalysis?.skillsAnalysis?.hardSkills;
    } else if (categoryKey === 'softSkills') {
      data = result?.detailedAnalysis?.skillsAnalysis?.softSkills;
    } else if (categoryKey === 'seniorityAlignment') {
      data = result?.detailedAnalysis?.experienceMatch?.seniorityAlignment;
    } else if (categoryKey === 'educationMatch') {
      data = result?.detailedAnalysis?.experienceMatch?.educationMatch;
    } else if (categoryKey === 'formattingAndStructure') {
      data = result?.detailedAnalysis?.formattingAndStructure;
    } else {
      data = result?.detailedAnalysis?.[categoryKey];
    }
    
    if (!data) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Info className="mx-auto mb-4 text-gray-300" size={48} />
          <p>No detailed analysis data available for this category.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* For new Gemini structure - Keyword Analysis */}
        {categoryKey === 'keywordAnalysis' && data.matchedKeywords && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Matched Keywords</h4>
            <div className="space-y-2">
              {data.matchedKeywords.map((keyword, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="text-green-600 mt-1" size={16} />
                  <div>
                    <span className="font-medium text-green-800">{keyword.keyword}</span>
                    {keyword.context && (
                      <span className="text-sm text-green-600 ml-2">({keyword.context})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* For new Gemini structure - Missing Keywords */}
        {categoryKey === 'keywordAnalysis' && data.missingKeywords && data.missingKeywords.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-3">Missing Keywords</h4>
            <div className="space-y-2">
              {data.missingKeywords.map((keyword, index) => (
                <div key={index} className="flex items-start gap-2">
                  <XCircle className="text-red-600 mt-1" size={16} />
                  <div>
                    <span className="font-medium text-red-800">{keyword.keyword}</span>
                    {keyword.importance && (
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        keyword.importance === 'High' ? 'bg-red-100 text-red-700' :
                        keyword.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {keyword.importance} Priority
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* For new Gemini structure - Skills Analysis */}
        {categoryKey === 'hardSkills' && data.identified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Identified Hard Skills</h4>
            <div className="flex flex-wrap gap-2">
              {renderArrayItems(data.identified, 12, 'green')}
            </div>
          </div>
        )}

        {categoryKey === 'hardSkills' && data.missing && data.missing.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-3">Missing Hard Skills</h4>
            <div className="flex flex-wrap gap-2">
              {renderArrayItems(data.missing, 8, 'red')}
            </div>
          </div>
        )}

        {categoryKey === 'softSkills' && data.identified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Identified Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {renderArrayItems(data.identified, 12, 'green')}
            </div>
          </div>
        )}

        {categoryKey === 'softSkills' && data.suggested && data.suggested.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">Suggested Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {renderArrayItems(data.suggested, 8, 'blue')}
            </div>
          </div>
        )}

        {/* For new Gemini structure - Experience Match */}
        {categoryKey === 'seniorityAlignment' && (
          <div className={`border rounded-lg p-4 ${
            data.isAligned ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {data.isAligned ? (
                <CheckCircle className="text-green-600 mt-1" size={20} />
              ) : (
                <XCircle className="text-red-600 mt-1" size={20} />
              )}
              <div>
                <h4 className={`font-medium mb-2 ${
                  data.isAligned ? 'text-green-900' : 'text-red-900'
                }`}>
                  Seniority Alignment: {data.isAligned ? 'Aligned' : 'Not Aligned'}
                </h4>
                {data.comment && (
                  <p className={`text-sm ${
                    data.isAligned ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {data.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {categoryKey === 'educationMatch' && (
          <div className={`border rounded-lg p-4 ${
            data.meetsRequirements ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {data.meetsRequirements ? (
                <CheckCircle className="text-green-600 mt-1" size={20} />
              ) : (
                <XCircle className="text-red-600 mt-1" size={20} />
              )}
              <div>
                <h4 className={`font-medium mb-2 ${
                  data.meetsRequirements ? 'text-green-900' : 'text-red-900'
                }`}>
                  Education Requirements: {data.meetsRequirements ? 'Meets' : 'Does Not Meet'}
                </h4>
                {data.comment && (
                  <p className={`text-sm ${
                    data.meetsRequirements ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {data.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* For new Gemini structure - Formatting and Structure */}
        {categoryKey === 'formattingAndStructure' && (
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${
              data.parsingRisk === 'High' ? 'bg-red-50 border-red-200' :
              data.parsingRisk === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`mt-1 ${
                  data.parsingRisk === 'High' ? 'text-red-600' :
                  data.parsingRisk === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`} size={20} />
                <div>
                  <h4 className={`font-medium mb-2 ${
                    data.parsingRisk === 'High' ? 'text-red-900' :
                    data.parsingRisk === 'Medium' ? 'text-yellow-900' :
                    'text-green-900'
                  }`}>
                    Parsing Risk: {data.parsingRisk}
                  </h4>
                  {data.overallFormattingScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Formatting Score:</span>
                      <span className={`font-medium ${
                        data.overallFormattingScore >= 80 ? 'text-green-600' :
                        data.overallFormattingScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {data.overallFormattingScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {data.issues && data.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3">Formatting Issues</h4>
                <ul className="space-y-1">
                  {renderIssues(data.issues)}
                </ul>
              </div>
            )}

            {data.repetitiveWords && data.repetitiveWords.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-3">Repetitive Words</h4>
                <div className="flex flex-wrap gap-2">
                  {renderArrayItems(data.repetitiveWords, 8, 'orange')}
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  These words are used too frequently. Consider using synonyms or varying your language.
                </p>
              </div>
            )}

            {data.quantificationIssues && data.quantificationIssues.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-3">Quantification Opportunities</h4>
                <ul className="space-y-1">
                  {renderSuggestions(data.quantificationIssues)}
                </ul>
                <p className="text-sm text-primary mt-2">
                  Add specific metrics and numbers to make your achievements more impactful.
                </p>
              </div>
            )}

            {data.spellingGrammarIssues && data.spellingGrammarIssues.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3">Spelling & Grammar Issues</h4>
                <ul className="space-y-1">
                  {renderIssues(data.spellingGrammarIssues)}
                </ul>
                <p className="text-sm text-purple-700 mt-2">
                  Fix these errors to improve the professional appearance of your resume.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fallback for other categories */}
        {!['keywordAnalysis', 'hardSkills', 'softSkills', 'seniorityAlignment', 'educationMatch', 'formattingAndStructure'].includes(categoryKey) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Analysis Data</h4>
            <pre className="text-sm text-gray-700 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };



  const renderActionableRecommendationsSection = () => (
    <div className="space-y-6">
      {result?.actionableRecommendations ? (
        <div className="space-y-4">
          {renderActionableRecommendations(result.actionableRecommendations)}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <Award className="mx-auto mb-4 text-gray-300" size={48} />
          <p>No actionable recommendations available</p>
        </div>
      )}
    </div>
  );

  const renderSectionContent = () => {
    if (currentSection === 'Executive Summary') {
      return renderExecutiveSummary();
    }

    // Check if this is a detailed analysis category
    const analysisCategory = categories.find(cat => cat.name === currentSection && cat.type === 'analysis');
    if (analysisCategory) {
      // Check if this is a premium category and user doesn't have access
      // Enterprise Pro admins and team members get full access
              if (analysisCategory.isPremium && !hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined)) {
        return (
          <div className="p-8 text-center">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Star className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unlock {currentSection}
              </h3>
              <p className="text-gray-600 mb-4">
                Get detailed insights into your resume's {currentSection.toLowerCase()} to improve your ATS score and job application success.
              </p>
              {analysisCategory.score && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Score:</span>
                    <span className={`text-sm font-bold ${
                      analysisCategory.score >= 80 ? 'text-green-600' : 
                      analysisCategory.score >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {analysisCategory.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analysisCategory.score >= 80 ? 'bg-green-500' : 
                        analysisCategory.score >= 60 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${analysisCategory.score}%` }}
                    />
                  </div>
                  {analysisCategory.issuesCount > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      ⚠️ {analysisCategory.issuesCount} {analysisCategory.issuesCount === 1 ? 'issue' : 'issues'} detected
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Detailed analysis and recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Specific improvement suggestions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Priority-based action items</span>
                </div>
              </div>
              <button 
                onClick={() => onUpgradeClick ? onUpgradeClick('basic', 'detailed-analysis') : window.open('/checkout?source=ats-score-checker', '_blank')}
                className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-accent-700 transition-all duration-200 shadow-lg"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        );
      }
      return renderDetailedAnalysis(analysisCategory.key);
    }

    // Check if this is actionable recommendations
    if (currentSection === 'Actionable Recommendations') {
      const recommendationsCategory = categories.find(cat => cat.name === currentSection);
              if (recommendationsCategory?.isPremium && !hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined)) {
        return (
          <div className="p-8 text-center">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Award className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unlock Actionable Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized, actionable recommendations to improve your resume and boost your job application success rate.
              </p>
              {recommendationsCategory.count && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Recommendations:</span>
                    <span className="text-sm font-bold text-primary">
                      {recommendationsCategory.count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>🎯 Priority-based</span>
                    <span>•</span>
                    <span>📝 Actionable</span>
                    <span>•</span>
                    <span>📈 Track progress</span>
                  </div>
                </div>
              )}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Priority-based recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Specific improvement actions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Track your progress</span>
                </div>
              </div>
              <button 
                onClick={() => onUpgradeClick ? onUpgradeClick('basic', 'detailed-analysis') : window.open('/checkout?source=ats-score-checker', '_blank')}
                className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-900 hover:to-accent-700 transition-all duration-200 shadow-lg"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        );
      }
      return renderActionableRecommendationsSection();
    }

    // Default to executive summary
    return renderExecutiveSummary();
  };

  return (
    <div className="ats-score-checker bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Resume ATS Analysis Results</h1>
          <button className="text-primary hover:text-primary font-medium text-sm sm:text-base self-end sm:self-auto">Print</button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {(() => {
              const analysisType = result?.analysisType?.toUpperCase();
              // Debug logging disabled to prevent console flooding
              // console.log('🔍 RENDERING ANALYSIS TYPE:', analysisType);
              
              if (analysisType === 'COMPARATIVE') {
                return 'Job-Specific Analysis';
              } else if (analysisType === 'GENERAL') {
                return 'General ATS Analysis';
              } else {
                // Fallback: check if we have job description context
                const hasJobDescription = result?.hasJobDescription || result?.jobDescription;
                // Debug logging disabled to prevent console flooding
                // console.log('🔍 FALLBACK CHECK - hasJobDescription:', hasJobDescription);
                return hasJobDescription ? 'Job-Specific Analysis' : 'General ATS Analysis';
              }
            })()}
          </h2>
          {(() => {
            const analysisType = result?.analysisType?.toUpperCase();
            const hasJobDescription = result?.hasJobDescription || result?.jobDescription;
            
            if (analysisType === 'COMPARATIVE' || (analysisType !== 'GENERAL' && hasJobDescription)) {
              return (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                  Job-Specific
                </div>
              );
            } else if (analysisType === 'GENERAL' || (!hasJobDescription && analysisType !== 'COMPARATIVE')) {
              return (
                <div className="bg-accent-50 text-primary px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                  General ATS
                </div>
              );
            }
            return null;
          })()}
          <Edit className="text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <div className="lg:w-1/3 bg-gray-50 p-3 sm:p-4 md:p-6 border-b border-gray-200 lg:border-b-0 lg:border-r">
          {/* Match Rate Gauge */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={getScoreColor(matchRate)}
                    strokeWidth="8"
                    strokeDasharray={`${(matchRate / 100) * 339.292} 339.292`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{matchRate}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">ATS Score</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="mt-3 sm:mt-4 bg-accent text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
              onClick={onReset}
            >
              <Upload size={14} className="sm:w-4 sm:h-4" />
              Upload & rescan
            </button>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Summary</h3>
              {!hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined) && (
                <span className="px-2 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full font-medium">
                  <Star size={10} className="inline mr-1" />
                  Basic
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Total Issues:</span>
                <span className="font-medium text-red-600">
                  {categories.reduce((total, cat) => total + (cat.issuesCount || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Categories with Issues:</span>
                <span className="font-medium text-orange-600">
                  {categories.filter(cat => cat.hasIssues).length}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Priority Issues:</span>
                <span className="font-medium text-red-600">
                  {categories.reduce((total, cat) => {
                    const highPriorityIssues = cat.issuesCount > 5 ? cat.issuesCount : 0;
                    return total + highPriorityIssues;
                  }, 0)}
                </span>
              </div>
              {result?.actionableRecommendations && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Recommendations:</span>
                  <span className="font-medium text-primary">
                    {result.actionableRecommendations.length}
                  </span>
                </div>
              )}
              {!hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined) && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Premium Categories:</span>
                    <span className="font-medium text-primary">
                      {categories.filter(cat => cat.isPremium).length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Analysis Categories</h3>
            {categories.map((category, index) => {
              const IconComponent = category.icon || FileText;
              const issuesCount = category.issuesCount || 0;
              const hasIssues = category.hasIssues || false;
              const isCategoryPremium = category.isPremium || false;
              const isDisabled = isCategoryPremium && !hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!isDisabled) {
                      setCurrentSection(category.name);
                    }
                  }}
                  className={`w-full rounded-lg p-2 sm:p-3 border text-left transition-colors ${
                    isDisabled 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                      : currentSection === category.name 
                        ? 'border-primary bg-slate-50' 
                        : 'bg-white border-gray-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <IconComponent className={`${isDisabled ? 'text-gray-400' : hasIssues ? 'text-orange-500' : 'text-gray-500'} sm:w-4 sm:h-4`} size={14} />
                    <span className={`text-xs sm:text-sm font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                    {/* {isDisabled && (
                      <span className="ml-auto px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-accent text-white">
                        <Star size={10} className="inline mr-1" />
                        Premium
                      </span>
                    )} */}
                    {issuesCount > 0 && (
                      <span className={`ml-auto px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        isDisabled 
                          ? 'bg-gray-100 text-gray-600' 
                          : issuesCount > 5 
                            ? 'bg-red-100 text-red-700' 
                            : issuesCount > 2 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {issuesCount} {issuesCount === 1 ? 'issue' : 'issues'}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar for sections with scores */}
                  {category.score && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                          isDisabled 
                            ? 'bg-gray-400' 
                            : category.score >= 80 
                              ? 'bg-green-500' 
                              : category.score >= 60 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className="flex items-center justify-between text-xs">
                    {isDisabled ? (
                      <>
                        {category.score && (
                          <span className="text-gray-500 font-medium">
                            {category.score}/100
                          </span>
                        )}
                        <span className="text-primary font-medium">
                          Upgrade to access
                        </span>
                      </>
                    ) : (
                      <>
                        {category.score && (
                          <span className={`font-medium ${
                            category.score >= 80 ? 'text-green-600' : 
                            category.score >= 60 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {category.score}/100
                          </span>
                        )}
                        {hasIssues && (
                          <span className="text-orange-600 font-medium">
                            Needs attention
                          </span>
                        )}
                        {!hasIssues && category.type !== 'summary' && (
                          <span className="text-green-600 font-medium">
                            Good
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-2/3 p-3 sm:p-4 md:p-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
            <button 
              className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors text-sm sm:text-base ${
                currentSection === 'Executive Summary' 
                  ? 'text-primary border-primary' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setCurrentSection('Executive Summary')}
            >
              Analysis
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{currentSection}</h2>
            {result?.analysisType?.toUpperCase() === 'COMPARATIVE' && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                Job-Specific
              </span>
            )}
            {result?.analysisType?.toUpperCase() === 'GENERAL' && (
              <span className="bg-accent-50 text-primary px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                General ATS
              </span>
            )}
          </div>

          {currentSection === 'Executive Summary' && (
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {result?.analysisType?.toUpperCase() === 'COMPARATIVE' 
                ? 'This comprehensive ATS analysis evaluates your resume\'s compatibility with the provided job description and provides detailed insights for improvement.'
                : 'This comprehensive ATS analysis evaluates your resume\'s compatibility with Applicant Tracking Systems and provides detailed insights for improvement.'
              }
            </p>
          )}

          {!hasEnterpriseAccess && (!isPremium && !isBasicPlan || isPremium === undefined) && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-primary sm:w-5 sm:h-5" size={18} />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Unlock Full Analysis</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 mb-3">
                You're currently viewing the Executive Summary. Upgrade to Premium to access detailed analysis of all categories including Keyword Analysis, Skills Assessment, and Actionable Recommendations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-gray-600">
                    {categories.filter(cat => cat.isPremium && cat.hasIssues).length} categories with issues
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full"></span>
                  <span className="text-gray-600">
                    {categories.filter(cat => cat.isPremium).length} premium insights
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onUpgradeClick ? onUpgradeClick('basic', 'detailed-analysis') : window.open('/checkout?source=ats-score-checker', '_blank')}
                className="bg-gradient-to-r from-primary to-accent text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-gray-900 hover:to-accent-700 transition-all duration-200"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Tip:</strong> Review all analysis categories to ensure your resume is optimized for ATS systems and human recruiters.
            </p>
          </div>

          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
} 