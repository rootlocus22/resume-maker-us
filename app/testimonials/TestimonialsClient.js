"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const testimonialsPerPage = 20; // Increased for compact view

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      
      // Fetch testimonials from API endpoint
      const response = await fetch('/api/testimonials?limit=200');
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        console.error('Error fetching testimonials:', data.error);
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (testimonial) => {
    if (testimonial.userProfile?.resumeData?.name) {
      return testimonial.userProfile.resumeData.name;
    }
    return testimonial.userProfile?.name || testimonial.name || 'Anonymous User';
  };

  const getCurrentCompany = (testimonial) => {
    const experience = testimonial.userProfile?.resumeData?.experience;
    if (experience && experience.length > 0) {
      const currentJob = experience.find(exp => !exp.endDate || exp.endDate === '') || experience[0];
      return currentJob?.company;
    }
    return null;
  };

  const getCurrentRole = (testimonial) => {
    const experience = testimonial.userProfile?.resumeData?.experience;
    if (experience && experience.length > 0) {
      const currentJob = experience.find(exp => !exp.endDate || exp.endDate === '') || experience[0];
      return currentJob?.jobTitle;
    }
    return null;
  };


  const getEducation = (testimonial) => {
    const education = testimonial.userProfile?.resumeData?.education;
    if (education && education.length > 0) {
      return education[0];
    }
    return null;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg 
        key={index} 
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400' 
            : 'text-gray-300'
        }`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filter === 'all') return true;
    if (filter === '5-star') return testimonial.rating === 5;
    if (filter === '4-star') return testimonial.rating === 4;
    if (filter === 'professionals') return getCurrentCompany(testimonial);
    if (filter === 'recent') {
      const date = new Date(testimonial.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date > thirtyDaysAgo;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);
  const startIndex = (currentPage - 1) * testimonialsPerPage;
  const currentTestimonials = filteredTestimonials.slice(startIndex, startIndex + testimonialsPerPage);

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '4.8';

  const stats = [
    { value: testimonials.length, label: 'Total Ratings', icon: '⭐', color: 'from-blue-500 to-indigo-500' },
    { value: testimonials.filter(t => t.rating === 5).length, label: '5-Star Ratings', icon: '🌟', color: 'from-amber-400 to-yellow-500' },
    { value: testimonials.filter(t => t.rating >= 4).length, label: '4+ Star Ratings', icon: '✨', color: 'from-blue-500 to-cyan-500' },
    { value: averageRating, label: 'Average Rating', icon: '📊', color: 'from-blue-500 to-rose-500' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading testimonials...</p>
          <p className="text-sm text-gray-400">Fetching the latest success stories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            Customer Reviews
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            See what our users are saying about ExpertResume
          </p>

          {/* Simple Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Filter Section */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All' },
              { key: '5-star', label: '5 Stars' },
              { key: '4-star', label: '4+ Stars' },
              { key: 'professionals', label: 'Professionals' },
              { key: 'recent', label: 'Recent' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => {
                  setFilter(filterOption.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Showing {currentTestimonials.length} of {filteredTestimonials.length} reviews
          </div>
        </div>
      </section>

      {/* Simple Testimonials Grid */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatePresence mode="wait">
            {filteredTestimonials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No ratings found</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4 sm:mb-6">
                  We couldn't find any ratings matching your filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Show All Ratings
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentPage}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {currentTestimonials.map((testimonial, index) => {
                  const displayName = getDisplayName(testimonial);
                  const company = getCurrentCompany(testimonial);
                  const role = getCurrentRole(testimonial);
                  const education = getEducation(testimonial);

                  return (
                    <motion.div
                      key={testimonial.id}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      {/* Rating Stars */}
                      <div className="flex items-center space-x-1 mb-3">
                        {renderStars(testimonial.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-600">{testimonial.rating}.0</span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {displayName}
                          </h4>
                          {company && role && (
                            <p className="text-xs text-blue-600 truncate">
                              {role} at {company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Education */}
                      {education && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600">
                            {education.degree}
                            {education.institution && (
                              <span className="text-gray-500"> • {education.institution}</span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-gray-400">
                        {formatDate(testimonial.timestamp)}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6 sm:mt-8">
              <nav className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* Simple Bottom CTA */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Create your professional resume with our AI-powered builder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/resume-builder"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Building Resume
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}