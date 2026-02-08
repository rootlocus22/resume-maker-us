"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Users, Award, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default function EnhancedTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Testimonials data - using curated testimonials directly
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      company: "Infosys",
      comment: "I was struggling to get interview calls for months. After using ExpertResume, I got 6 interview calls in just 3 weeks! The ATS score checker helped me fix all the issues in my resume. Highly recommend to everyone!",
      rating: 5,
      result: "6 interviews in 3 weeks"
    },
    {
      name: "Rahul Patel",
      role: "Product Manager",
      company: "Flipkart",
      comment: "This is exactly what I needed. The job description resume builder feature is amazing - it helped me tailor my resume for each application. Got my dream job at Flipkart thanks to ExpertResume!",
      rating: 5,
      result: "Landed dream job"
    },
    {
      name: "Sneha Reddy",
      role: "Business Analyst",
      company: "TCS",
      comment: "Being a fresher, I had no idea how to make my resume stand out. ExpertResume made it so easy with ready templates and AI suggestions. Got placed in my campus interviews with much better package than expected.",
      rating: 5,
      result: "Campus placement success"
    },
    {
      name: "Amit Kumar",
      role: "Data Scientist",
      company: "Accenture",
      comment: "The resume parser saved me hours of work. I just uploaded my old resume and it automatically filled everything. Then I used the ATS checker and improved my score from 45% to 89%. Worth every dollar!",
      rating: 5,
      result: "ATS score 45% → 89%"
    },
    {
      name: "Anjali Verma",
      role: "HR Manager",
      company: "Wipro",
      comment: "I've been in HR for 8 years and I can tell you - ExpertResume resumes definitely stand out. When I was switching jobs, I used it myself and got calls from 4 top companies. The templates are professional and ATS-friendly.",
      rating: 5,
      result: "4 top company calls"
    },
    {
      name: "Vikram Singh",
      role: "Marketing Executive",
      company: "Asian Paints",
      comment: "My previous resume was getting rejected everywhere. After rebuilding it on ExpertResume with their suggestions, I started getting responses. The interview trainer feature also helped me prepare well. Got the job in 2 months!",
      rating: 5,
      result: "Job in 2 months"
    },
    {
      name: "Divya Iyer",
      role: "Financial Analyst",
      company: "HDFC Bank",
      comment: "I was skeptical at first but this really works. The AI analyzed my resume and suggested better ways to write my achievements. My interview rate increased significantly after the changes. Thank you ExpertResume!",
      rating: 5,
      result: "Better interview rate"
    },
    {
      name: "Arjun Nair",
      role: "Full Stack Developer",
      company: "Amazon",
      comment: "As someone who applied to multiple companies, the job-specific resume builder was a game changer. I could quickly customize my resume for each application. Got offers from 3 companies including Amazon!",
      rating: 5,
      result: "3 job offers"
    },
    {
      name: "Pooja Gupta",
      role: "UI/UX Designer",
      company: "Swiggy",
      comment: "The templates are beautiful and modern. As a designer, I'm quite particular about design and I was impressed. The resume looked professional and helped me get noticed. Highly satisfied with the service.",
      rating: 5,
      result: "Professional design"
    },
    {
      name: "Karthik Menon",
      role: "Operations Manager",
      company: "Zomato",
      comment: "I had a career gap of 2 years and was worried about how to present my resume. ExpertResume's suggestions helped me highlight my skills better. Got back to work within a month of serious job search!",
      rating: 5,
      result: "Career comeback"
    },
    {
      name: "Meera Joshi",
      role: "Business Development Executive",
      company: "Paytm",
      comment: "The resume builder is so intuitive and user-friendly. I completed my professional resume in less than 30 minutes. The AI suggestions were spot-on and helped me present my achievements better. Got multiple interview calls!",
      rating: 5,
      result: "Multiple interviews"
    },
    {
      name: "Rajesh Khanna",
      role: "Sales Manager",
      company: "Coca-Cola",
      comment: "I've recommended ExpertResume to all my colleagues. The job-specific resume feature is brilliant - it helped me customize my resume for different sales roles. Landed my current position at Coca-Cola!",
      rating: 5,
      result: "Role-specific success"
    },
    {
      name: "Sanjana Reddy",
      role: "HR Executive",
      company: "Dell",
      comment: "As an HR professional, I know what makes a resume stand out. ExpertResume helped me create a resume that not only looks professional but also passes ATS scans perfectly. Highly recommend for anyone job hunting!",
      rating: 5,
      result: "ATS-approved resume"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex] || testimonials[0];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full text-sm font-semibold text-blue-700 mb-6">
            <Users className="w-4 h-4" />
            Success Stories from Real Users
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            What Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Happy Users</span> Say
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join 100,000+ professionals who have transformed their careers with ExpertResume
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left - Testimonial Display */}
          <div className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-3xl p-8 lg:p-10 border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  role="article"
                  aria-label={`Testimonial from ${currentTestimonial.name}`}
                >
                  {/* Quote Icon */}
                  <div 
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    aria-hidden="true"
                  >
                    <Quote className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Rating */}
                  <div 
                    className="flex items-center gap-1 mb-6"
                    role="img"
                    aria-label={`${currentTestimonial.rating} out of 5 stars rating`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <blockquote 
                    className="text-xl text-gray-700 mb-6 leading-relaxed font-medium"
                    aria-label={`Quote: ${currentTestimonial.comment}`}
                  >
                    "{currentTestimonial.comment}"
                  </blockquote>
                  
                  {/* Result Badge */}
                  <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 px-4 py-2 rounded-xl mb-6">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700 font-bold text-sm">
                      Result: {currentTestimonial.result}
                    </span>
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {currentTestimonial.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{currentTestimonial.name}</p>
                      <p className="text-gray-600">{currentTestimonial.role}</p>
                      <p className="text-blue-600 text-sm font-semibold">{currentTestimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation Dots */}
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentIndex(index);
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      index === currentIndex 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 w-8' 
                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial from ${testimonials[index].name}`}
                    aria-current={index === currentIndex ? 'true' : 'false'}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Stats and Features */}
          <div className={`space-y-6 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">100k+</div>
                <div className="text-gray-600 font-medium">Happy Users</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">4.9★</div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>

            {/* Platform Features */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Why Choose ExpertResume
              </h3>
              
              <div 
                className="space-y-4"
                role="list"
                aria-label="Platform features"
              >
                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p 
                        className="font-bold text-gray-900"
                        id="ats-optimized-label"
                      >
                        ATS-Optimized
                      </p>
                      <p className="text-gray-600 text-sm">All templates tested</p>
                    </div>
                  </div>
                  <div 
                    className="text-right"
                    role="text"
                    aria-labelledby="ats-optimized-label"
                  >
                    <p className="text-3xl font-bold text-green-600">100%</p>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p 
                        className="font-bold text-gray-900"
                        id="templates-label"
                      >
                        Professional Templates
                      </p>
                      <p className="text-gray-600 text-sm">Industry-specific</p>
                    </div>
                  </div>
                  <div 
                    className="text-right"
                    role="text"
                    aria-labelledby="templates-label"
                  >
                    <p className="text-3xl font-bold text-blue-600">50+</p>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p 
                        className="font-bold text-gray-900"
                        id="features-label"
                      >
                        AI-Powered Tools
                      </p>
                      <p className="text-gray-600 text-sm">Smart suggestions</p>
                    </div>
                  </div>
                  <div 
                    className="text-right"
                    role="text"
                    aria-labelledby="features-label"
                  >
                    <p className="text-3xl font-bold text-purple-600">5+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Logos */}
            <div 
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg"
              role="region"
              aria-labelledby="company-logos-title"
            >
              <h3 
                id="company-logos-title"
                className="text-lg font-bold text-gray-900 mb-4 text-center"
              >
                Our Users Work At
              </h3>
              <div 
                className="flex items-center justify-around"
                role="list"
                aria-label="Companies where our users work"
              >
                {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
                  <div 
                    key={company} 
                    className="text-center"
                    role="listitem"
                  >
                    <div 
                      className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mx-auto mb-1 flex items-center justify-center border border-gray-200"
                      aria-hidden="true"
                    >
                      <span className="text-xs font-bold text-gray-600">{company[0]}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{company}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
