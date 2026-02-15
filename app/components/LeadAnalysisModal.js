"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';

const LeadAnalysisModal = ({ lead, isOpen, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);

  // Clear analysis data when lead changes or modal opens
  useEffect(() => {
    if (isOpen && lead?.id !== currentLeadId) {
      setAnalysis(null);
      setLoading(false);
      setError(null);
      setCurrentLeadId(lead?.id);
    }
  }, [isOpen, lead?.id, currentLeadId]);

  // Clear data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnalysis(null);
      setLoading(false);
      setError(null);
      setCurrentLeadId(null);
    }
  }, [isOpen]);

  const analyzeLeadWithAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead)
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'HIGH': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceBarColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">AI Lead Analysis</h2>
                <p className="text-accent-100">Smart recommendations for {lead?.profile?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Lead Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Lead Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="font-medium ml-2">{lead?.profile?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-600">Job Title:</span>
                <span className="font-medium ml-2">{lead?.profile?.jobTitle || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium ml-2">{lead?.profile?.yearsOfExperience || 0} years</span>
              </div>
              <div>
                <span className="text-gray-600">Entry Point:</span>
                <span className="font-medium ml-2">{lead?.entryPoint || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Analysis Button */}
          {!analysis && !loading && (
            <div className="text-center mb-6">
              <button
                onClick={analyzeLeadWithAI}
                className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-lg hover:from-primary-800 hover:to-accent-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Brain className="w-5 h-5" />
                <span>Analyze Lead with AI</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-gray-600">AI is analyzing this lead...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={analyzeLeadWithAI}
                className="mt-3 text-red-600 hover:text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Recommendation & Confidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${getRecommendationColor(analysis.recommendation)}`}>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">Recommendation</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{analysis.recommendation} PRIORITY</p>
                </div>
                
                <div className="p-4 bg-accent-50 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-primary">Confidence Score</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">{analysis.confidenceScore}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getConfidenceBarColor(analysis.confidenceScore)}`}
                        style={{ width: `${analysis.confidenceScore * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">AI Reasoning</h4>
                <p className="text-gray-700">{analysis.reasoning}</p>
              </div>

              {/* Pain Points */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Identified Pain Points</h4>
                <ul className="space-y-2">
                  {analysis.painPoints?.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value Proposition */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Key Value Proposition</h4>
                <p className="text-green-700">{analysis.valueProposition}</p>
              </div>

              {/* Conversation Topics */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Conversation Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.conversationTopics?.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-accent-50 text-primary rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call Script */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Personalized Call Script</h4>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(analysis.callScript, null, 2))}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Opening</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{analysis.callScript?.opening}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Pain Point Discovery</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{analysis.callScript?.painPointDiscovery}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Value Presentation</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{analysis.callScript?.valuePresentation}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Objection Handling</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{analysis.callScript?.objectionHandling}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Closing</h5>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{analysis.callScript?.closing}</p>
                  </div>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <h5 className="font-medium text-gray-800">Best Time to Call</h5>
                  </div>
                  <p className="text-gray-700 text-sm">{analysis.bestTimeToCall}</p>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <h5 className="font-medium text-gray-800">Follow-up Strategy</h5>
                  </div>
                  <p className="text-gray-700 text-sm">{analysis.followUpStrategy}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {lead?.profile?.phone && (
                  <a
                    href={`tel:${lead.profile.phone}`}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                )}
                
                {lead?.profile?.email && (
                  <a
                    href={`mailto:${lead.profile.email}`}
                    className="flex items-center justify-center space-x-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadAnalysisModal;
