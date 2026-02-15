"use client";

/**
 * Enhanced Templates Page with Responsive Design
 * 
 * FEATURES:
 * - Fully responsive design for mobile, tablet, and desktop
 * - Mobile-first approach with progressive enhancement
 * - Touch-friendly interactions and mobile-optimized layouts
 * - Proper template redirection to resume builder
 * - Enhanced mobile experience with always-visible action buttons
 * - Responsive grid layouts that adapt to screen sizes
 * - Mobile-optimized search and filtering
 * - Touch-friendly preview modal
 * 
 * RESPONSIVE BREAKPOINTS:
 * - Mobile: < 640px (sm)
 * - Tablet: 640px - 1024px (sm to lg)
 * - Desktop: > 1024px (lg+)
 * 
 * TEMPLATE FUNCTIONALITY:
 * - "Use Template" button correctly redirects to resume builder
 * - Template ID is passed via URL parameter
 * - Job-specific templates redirect to job-specific builder
 * - Regular templates redirect to standard resume builder
 * - Template selection is tracked for analytics
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ArrowRight, Search, Filter, Sparkles, Grid, List, Eye, Download, Heart, CheckCircle, Zap, TrendingUp, Crown, Award, Users, Target, ChevronDown, X, Play } from "lucide-react";
import { event } from "../lib/gtag";
import TemplateDiscovery from "../components/TemplateDiscovery";
import { searchTemplates, getSearchSuggestions, getPopularSearchTerms } from "../lib/templateSearch";

// Utility functions for template categories
const getCategoryIcon = (category) => {
  const icons = {
    "Executive": "👔",
    "Minimal": "⚡",
    "Classic": "📄",
    "Professional": "💼",
    "Modern": "🚀",
    "Creative": "🎨",
    "Tech": "💻",
    "Job-Specific": "🎯",
    "Portfolio": "📁",
    "Timeline": "📈",
    "Infographic": "📊"
  };
  return icons[category] || "📄";
};

const getCategoryColor = (category) => {
  const colors = {
    "Classic": "from-slate-600 to-slate-800",
    "Professional": "from-primary to-accent",
    "Modern": "from-primary to-accent",
    "Creative": "from-pink-600 to-pink-800",
    "Executive": "from-gray-700 to-gray-900",
    "Minimal": "from-cyan-600 to-cyan-800",
    "Tech": "from-primary to-accent",
    "Job-Specific": "from-orange-600 to-orange-800",
    "Portfolio": "from-violet-600 to-violet-800",
    "Timeline": "from-teal-600 to-teal-800",
    "Infographic": "from-emerald-600 to-emerald-800"
  };
  return colors[category] || "from-gray-600 to-gray-800";
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTerms, setPopularTerms] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // Changed from 1024 to 768 for proper desktop rendering
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/get-templates');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const fetchedTemplates = data.templates || [];
        setTemplates(fetchedTemplates);
        console.log(`✅ Loaded ${fetchedTemplates.length} templates from API`);

        // Generate popular search terms
        if (fetchedTemplates.length > 0) {
          const terms = getPopularSearchTerms(fetchedTemplates);
          setPopularTerms(terms);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handle search input changes with suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      const suggestions = getSearchSuggestions(templates, value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    event({
      action: "use_search_suggestion",
      category: "Templates",
      label: suggestion,
    });
  };

  // Track page view on mount
  useEffect(() => {
    event({
      action: "view_templates_page",
      category: "Templates",
      label: "PageLoad",
    });
  }, []);

  const categories = ["All", ...new Set(templates.map(t => t.category))];

  // Use advanced search with fuzzy matching and relevance scoring
  const filteredTemplates = (() => {
    let results = templates;

    // Apply advanced search if there's a search term
    if (searchTerm && searchTerm.trim() !== "") {
      results = searchTemplates(templates, searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      results = results.filter(template => template.category === selectedCategory);
    }

    // Sort by relevance score if searching, otherwise keep original order
    if (searchTerm && searchTerm.trim() !== "") {
      return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    return results;
  })();

  // Group templates by category for better organization
  const groupedTemplates = categories.reduce((acc, category) => {
    if (category === "All") return acc;
    acc[category] = filteredTemplates.filter(t => t.category === category);
    return acc;
  }, {});

  const getBuilderUrl = (templateId, template) => {
    if (template?.category === 'One-Pager') {
      // For one-pager templates, use the templateId property or fallback to the key
      return `/one-pager-builder/editor?template=${template.templateId || templateId}`;
    }
    if (template?.category === 'Job-Specific') {
      return `/job-specific-resume-builder?template=${templateId}`;
    }
    return `/resume-builder?template=${templateId}`;
  };

  const handleHover = (templateId) => {
    if (!isMobile) {
      setHoveredTemplate(templateId);
      const template = templates.find(t => t.id === templateId);
      event({
        action: "hover_template",
        category: "Templates",
        label: template?.name || templateId,
        value: templateId,
      });
    }
  };

  const handleTemplateClick = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    event({
      action: "select_template",
      category: "Templates",
      label: template?.name || templateId,
      value: templateId,
    });
  };

  if (isLoading) {
    return (
      <div className="templates-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Loading Hero */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="animate-pulse">
              <div className="h-5 sm:h-6 bg-gradient-to-r from-accent/20 to-accent/20 rounded-full w-24 sm:w-32 mx-auto mb-4 sm:mb-6"></div>
              <div className="h-12 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl w-3/4 mx-auto mb-4 sm:mb-6"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded-xl w-1/2 mx-auto"></div>
            </div>
          </div>

          {/* Loading Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="group animate-pulse">
                <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-border overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  <div className="p-4 sm:p-6">
                    <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-3/4 mb-2 sm:mb-3"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-1/2 mb-3 sm:mb-4"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded-xl w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="templates-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-red-100 p-6 sm:p-8 text-center">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-xl sm:text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Unable to Load Templates</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:opacity-95 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-primary to-primary text-white py-3 px-4 text-center text-sm font-medium">
        <div className="max-w-8xl mx-auto flex items-center justify-center gap-2">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span>Join 100,000+ professionals who landed their dream jobs with our templates</span>
          <Award className="w-4 h-4 text-yellow-400 ml-2" />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Premium Hero Section */}
        <div className="text-center py-8 sm:py-12 lg:py-16 relative">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-full max-w-4xl h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-primary/10 to-primary/10 blur-3xl rounded-full z-0"></div>

          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-accent/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 shadow-lg relative z-10">
            <Sparkles className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-primary font-semibold text-xs sm:text-sm">World-Class Templates</span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6 relative z-10">
            <span className="bg-gradient-to-r from-slate-900 via-primary to-primary bg-clip-text text-transparent">
              Your Dream Career
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-accent bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 relative z-10 px-4">
            {templates.length}+ professionally designed, ATS-optimized templates trusted by professionals worldwide.
            <span className="font-semibold text-primary"> Create stunning resumes in minutes.</span>
          </p>

          {/* Premium Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8 relative z-10 px-4">
            <div className="text-center bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">{templates.length}+</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Premium Templates</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Resumes Created</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">95%</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Success Rate</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">Expert Support</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto relative z-10 px-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search Input with Suggestions */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search templates by name, category, or style..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setShowSuggestions(false);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 pr-8 sm:pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "All" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Search Results Summary */}
              {(searchTerm || selectedCategory !== "All") && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                      {searchTerm && ` for "${searchTerm}"`}
                      {selectedCategory !== "All" && ` in ${selectedCategory}`}
                    </span>
                    {(searchTerm || selectedCategory !== "All") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                        }}
                        className="text-primary hover:text-primary font-medium transition-colors duration-200"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Popular Search Suggestions */}
              {!searchTerm && selectedCategory === "All" && popularTerms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-600 font-medium">Popular searches:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="px-3 py-1.5 bg-gradient-to-r from-primary/5 to-cyan-50 hover:from-accent/10 hover:to-accent/20 text-primary rounded-full text-xs font-medium transition-all duration-200 border border-accent/20 hover:border-accent/30"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Discovery - Featured */}
          <div className="max-w-4xl mx-auto mb-8 px-4">
            <div className="bg-gradient-to-r from-primary via-primary to-cyan-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-[22px] p-6 sm:p-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/5 to-cyan-50 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-primary font-semibold text-sm">NEW: Smart Template Finder</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Not sure which template to choose?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Answer <span className="font-semibold text-primary">5 quick questions</span> and we'll recommend the perfect templates for your experience level, industry, and goals. Takes just 60 seconds!
                  </p>
                  <button
                    onClick={() => setShowDiscovery(true)}
                    className="bg-gradient-to-r from-primary via-primary to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 mx-auto group"
                  >
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    Find My Perfect Template
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  <p className="text-xs text-gray-500 mt-3">⚡ Takes 60 seconds • 🎯 5 questions • ✨ Get 5 personalized matches</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10 px-4">
            <Link href="#templates">
              <button className="bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Browse All Templates</span>
              </button>
            </Link>
            <Link href="/resume-builder">
              <button className="bg-white text-gray-900 border-2 border-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">Start Building</span>
              </button>
            </Link>
          </div>
        </div>




        {/* World-Class Template Grid */}
        <div id="templates">
          {filteredTemplates.length > 0 ? (
            <div className="mb-12 lg:mb-16">
              {selectedCategory === "All" ? (
                <>
                  {/* Mobile: Show by categories with breaks */}
                  <div className="block lg:hidden">
                    {Object.entries(groupedTemplates).map(([category, categoryTemplates]) =>
                      categoryTemplates.length > 0 && (
                        <div key={category} className="mb-8 sm:mb-12">
                          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className={`inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r ${getCategoryColor(category)} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg`}>
                              <span className="text-lg sm:text-xl">{getCategoryIcon(category)}</span>
                              <span className="font-bold text-base sm:text-lg">{category}</span>
                              <div className="bg-white/20 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold">
                                {categoryTemplates.length}
                              </div>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {categoryTemplates.map((template) => (
                              <TemplateCard
                                key={template.id}
                                template={template}
                                hoveredTemplate={hoveredTemplate}
                                onHover={handleHover}
                                onClick={handleTemplateClick}
                                getBuilderUrl={getBuilderUrl}
                                setPreviewModal={setPreviewModal}
                                isMobile={isMobile}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Desktop: Continuous grid without breaks */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                      {filteredTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          hoveredTemplate={hoveredTemplate}
                          onHover={handleHover}
                          onClick={handleTemplateClick}
                          getBuilderUrl={getBuilderUrl}
                          setPreviewModal={setPreviewModal}
                          isMobile={isMobile}
                          showCategoryBadge={true}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Show single category
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      hoveredTemplate={hoveredTemplate}
                      onHover={handleHover}
                      onClick={handleTemplateClick}
                      getBuilderUrl={getBuilderUrl}
                      setPreviewModal={setPreviewModal}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-border p-8 sm:p-12 max-w-lg mx-auto">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <Search size={24} className="text-gray-400 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No templates found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  We couldn't find any templates matching your search. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:opacity-95 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Premium Features Section */}
        <div className="bg-gradient-to-br from-slate-50 to-primary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16 border border-gray-200/50">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-slate-800 to-accent bg-clip-text text-transparent">
            Why Professionals Choose Our Templates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-accent/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">ATS Optimized</h3>
              <p className="text-sm sm:text-base text-gray-600">Designed to pass through Applicant Tracking Systems with ease</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary/5 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Professional Design</h3>
              <p className="text-sm sm:text-base text-gray-600">Created by award-winning designers with hiring expertise</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Easy Customization</h3>
              <p className="text-sm sm:text-base text-gray-600">Change colors, fonts, and layouts with just a few clicks</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Multiple Formats</h3>
              <p className="text-sm sm:text-base text-gray-600">Export to PDF, Word, or share directly with employers</p>
            </div>
          </div>
        </div>

        {/* World-Class CTA Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-primary to-primary rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 xl:p-16 text-center text-white shadow-2xl mb-12 sm:mb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/20"></div>
          <div className="absolute top-0 left-1/4 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
              <TrendingUp className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-yellow-100 font-semibold text-xs sm:text-sm">Join 50K+ Professionals</span>
              <Sparkles className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold mb-4 sm:mb-6">
              Ready to Land Your
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Job?
              </span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
              Join thousands of professionals who've transformed their careers with our world-class resume templates.
              <span className="text-white font-semibold"> Start building your perfect resume today.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link href="/resume-builder" className="group w-full sm:w-auto">
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 w-full">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Start Building Now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/resume-examples" className="group w-full sm:w-auto">
                <button className="text-white border-2 border-white/30 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:border-white/50 flex items-center justify-center gap-2 sm:gap-3 w-full">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>View Examples</span>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 opacity-70">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">4.9★</div>
                <div className="text-xs sm:text-sm text-white/60">User Rating</div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-accent">ATS</div>
                <div className="text-xs sm:text-sm text-white/60">Optimized</div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-accent">24/7</div>
                <div className="text-xs sm:text-sm text-white/60">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setPreviewModal(null)}
          >
            <div
              className="relative bg-white rounded-2xl sm:rounded-3xl max-w-4xl sm:max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{previewModal.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{previewModal.category} Template</p>
                </div>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors self-end sm:self-auto"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <img
                  src={`${previewModal.previewImage}${previewModal.previewImage.includes('?') ? '&' : '?'}v=2`}
                  alt={`${previewModal.name} Preview`}
                  className="w-full h-auto rounded-xl sm:rounded-2xl shadow-lg object-contain"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    width: 'auto',
                    height: 'auto'
                  }}
                  onError={(e) => {
                    // Fallback to original image if cache-busted version fails
                    e.target.src = previewModal.previewImage;
                  }}
                />

                <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Template Features</h4>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span>ATS Optimized Layout</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span>Modern Design</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span>Fully Customizable</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span>Print Ready</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Best For</h4>
                    <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <p className="text-primary text-sm sm:text-base">
                        {previewModal.category === "Executive" && "Senior managers, directors, and C-level executives"}
                        {previewModal.category === "Professional" && "Established professionals with 5+ years of experience"}
                        {previewModal.category === "Creative" && "Designers, artists, and creative professionals"}
                        {previewModal.category === "Tech" && "Developers, engineers, and IT professionals"}
                        {previewModal.category === "Minimal" && "Those who prefer clean, straightforward designs"}
                        {previewModal.category === "Modern" && "Forward-thinking professionals in innovative industries"}
                        {previewModal.category === "Classic" && "Traditional industries like law, finance, and academia"}
                        {!["Executive", "Professional", "Creative", "Tech", "Minimal", "Modern", "Classic"].includes(previewModal.category) && "Professionals looking for a unique and distinctive resume design"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link href={getBuilderUrl(previewModal.id, previewModal)} className="flex-1">
                    <button
                      className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:opacity-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                      onClick={() => handleTemplateClick(previewModal.id)}
                    >
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      Use This Template
                    </button>
                  </Link>
                  <button className="px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Discovery Modal */}
        {showDiscovery && (
          <TemplateDiscovery
            templates={templates}
            onClose={() => setShowDiscovery(false)}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Template Card Component with better responsiveness
function TemplateCard({ template, hoveredTemplate, onHover, onClick, getBuilderUrl, setPreviewModal, isMobile, showCategoryBadge = false }) {
  return (
    <div
      className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-border overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 transform hover:scale-[1.02] cursor-pointer template-card"
      data-category={template.category}
      onMouseEnter={() => !isMobile && onHover(template.id)}
      onMouseLeave={() => !isMobile && onHover(null)}
    >
      {/* Template Preview */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 template-preview ${template.category === 'ATS-Optimized' ? 'aspect-[2/3]' : 'aspect-[4/5]'
        }`}>
        <img
          src={`${template.previewImage}${template.previewImage.includes('?') ? '&' : '?'}v=2`}
          alt={`${template.name} Template Preview`}
          className={`w-full h-full object-contain transition-all duration-700 ${hoveredTemplate === template.id ? "scale-110" : "scale-100"
            }`}
          loading="lazy"
          onError={(e) => {
            // Fallback to original image if cache-busted version fails
            e.target.src = template.previewImage;
          }}
        />

        {/* Premium Badge */}
        {template.premium && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
              <Crown size={10} className="fill-current sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Premium</span>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <div className={`backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${showCategoryBadge
            ? `bg-gradient-to-r ${getCategoryColor(template.category)} shadow-lg`
            : "bg-black/70"
            }`}>
            {showCategoryBadge && <span className="mr-1">{getCategoryIcon(template.category)}</span>}
            <span className="hidden sm:inline">{template.category}</span>
            <span className="sm:hidden">{template.category.split(' ')[0]}</span>
          </div>
        </div>

        {/* Hover Overlay - Desktop Only */}
        {!isMobile && hoveredTemplate === template.id && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
            <div className="p-4 sm:p-6 w-full space-y-2 sm:space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModal(template);
                }}
                className="w-full bg-white/95 backdrop-blur-sm text-slate-900 py-2 sm:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg border border-white/20 mb-2"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">Quick Preview</span>
                <span className="sm:hidden">Preview</span>
              </button>

              <Link href={getBuilderUrl(template.id, template)} className="block">
                <button
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 sm:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(template.id);
                  }}
                >
                  <Zap size={16} />
                  <span className="hidden sm:inline">Use Template</span>
                  <span className="sm:hidden">Use</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4 sm:p-6">
        <div className="mb-3 sm:mb-4">
          <Link href={`/resume-templates/${template.id}`} className="block">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-tight">
              {template.name}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
            <CheckCircle size={12} className="text-accent flex-shrink-0" />
            <span className="hidden sm:inline">ATS Optimized • Professional</span>
            <span className="sm:hidden">ATS Optimized</span>
          </p>
        </div>

        {/* Popularity Indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 sm:mb-4">
          <div className="flex items-center">
            <Star size={10} className="text-yellow-400 fill-current sm:w-3 sm:h-3" />
            <Star size={10} className="text-yellow-400 fill-current sm:w-3 sm:h-3" />
            <Star size={10} className="text-yellow-400 fill-current sm:w-3 sm:h-3" />
            <Star size={10} className="text-yellow-400 fill-current sm:w-3 sm:h-3" />
            <Star size={10} className="text-yellow-400 fill-current sm:w-3 sm:h-3" />
          </div>
          <span className="hidden sm:inline">({Math.floor(Math.random() * 100) + 100})</span>
        </div>

        {/* Mobile Actions - Always visible on mobile */}
        {isMobile && (
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewModal(template);
              }}
              className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
              <span className="sm:hidden">Preview</span>
            </button>

            <Link href={getBuilderUrl(template.id, template)} className="block" rel="nofollow">
              <button
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(template.id);
                }}
              >
                <Zap size={16} />
                <span className="hidden sm:inline">Use Template</span>
                <span className="sm:hidden">Use</span>
              </button>
            </Link>
          </div>
        )}

        {/* Desktop Quick Action */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Link href={`/resume-templates/${template.id}`}>
              <button className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
                Details
              </button>
            </Link>
            <Link href={getBuilderUrl(template.id, template)} rel="nofollow">
              <button
                className="text-sm font-semibold text-primary hover:text-primary flex items-center gap-2 hover:gap-3 transition-all group/button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(template.id);
                }}
              >
                <span className="hidden sm:inline">Use Template</span>
                <span className="sm:hidden">Use</span>
                <ArrowRight size={14} className="group-hover/button:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}