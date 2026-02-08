"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Sparkles, Target, Zap, TrendingUp, MapPin, Briefcase, 
  Clock, Shield, CheckCircle, ArrowRight, Users, BarChart3, 
  Bot, Crown, Star, ChevronRight, AlertCircle, Globe, Filter,
  FileText, Award, DollarSign, Calendar, Bell
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { event } from "../lib/gtag";

export default function AIJobSearchFeaturePage() {
  const { user, isPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Track page view
    event({
      action: "feature_page_view",
      category: "JobSearch",
      label: "AIJobSearchLanding",
    });
  }, []);

  const handleCTAClick = (ctaLabel) => {
    event({
      action: "feature_cta_click",
      category: "JobSearch",
      label: ctaLabel,
    });
    
    if (user && isPremium) {
      router.push('/jobs-nearby');
    } else if (user) {
      router.push('/pricing?feature=jobs');
    } else {
      router.push('/signup?redirect=jobs-nearby');
    }
  };

  return (
    <>
      {/* Structured Data for SEO - Metadata is handled by layout.js */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ExpertResume AI Job Search",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "200",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "15000"
            },
            "description": "AI-powered job search tool that analyzes your resume and finds personalized job opportunities. Track applications, get real-time notifications, and land your dream job faster.",
            "featureList": [
              "AI-powered job matching",
              "Personalized recommendations",
              "Application tracking",
              "Real-time job alerts",
              "Multi-platform search",
              "Smart filters"
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>AI-Powered Career Intelligence</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Find Your Dream Job
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                  10x Faster with AI
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Let AI analyze your resume and discover personalized job opportunities across 20+ platforms. 
                Track applications, get instant alerts, and land interviews faster.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={() => handleCTAClick("Hero_GetStarted")}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 shadow-2xl hover:shadow-3xl hover:scale-105 group"
                >
                  <Search className="w-5 h-5" />
                  Start Finding Jobs Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <Link href="#features">
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2 border-2 border-white/30">
                    <Sparkles className="w-5 h-5" />
                    See How It Works
                  </button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">15,000+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">50,000+ Jobs Matched</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 sm:h-20 fill-current text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "20+", label: "Job Platforms", icon: Globe },
                { number: "50K+", label: "Active Jobs", icon: Briefcase },
                { number: "95%", label: "Match Accuracy", icon: Target },
                { number: "10x", label: "Faster Results", icon: Zap }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features to Accelerate Your Job Hunt
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to find, track, and land your perfect job opportunity
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Bot,
                  title: "AI-Powered Matching",
                  description: "Our AI analyzes your resume, skills, and experience to find jobs that perfectly match your profile. No more endless scrolling through irrelevant listings.",
                  color: "blue"
                },
                {
                  icon: MapPin,
                  title: "Location-Based Search",
                  description: "Find opportunities near you or set your preferred location. Search locally or explore remote positions across India and globally.",
                  color: "green"
                },
                {
                  icon: Target,
                  title: "Smart Filters",
                  description: "Filter by salary, experience level, company size, industry, and more. Our intelligent filters learn from your preferences.",
                  color: "purple"
                },
                {
                  icon: Bell,
                  title: "Real-Time Alerts",
                  description: "Get instant notifications when new jobs matching your criteria are posted. Never miss an opportunity again.",
                  color: "yellow"
                },
                {
                  icon: BarChart3,
                  title: "Application Tracker",
                  description: "Track all your applications in one place. Monitor status changes, save jobs for later, and manage your entire job search pipeline.",
                  color: "indigo"
                },
                {
                  icon: Sparkles,
                  title: "Multi-Platform Search",
                  description: "Search across LinkedIn, Naukri, Indeed, Glassdoor, and 20+ other platforms simultaneously. One search, unlimited opportunities.",
                  color: "pink"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in 3 simple steps and transform your job search
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -translate-y-1/2 -z-10"></div>

              {[
                {
                  step: "1",
                  icon: FileText,
                  title: "Upload Your Resume",
                  description: "Our AI instantly analyzes your skills, experience, and career goals from your existing resume."
                },
                {
                  step: "2",
                  icon: Search,
                  title: "Get AI Matches",
                  description: "Receive personalized job recommendations from 20+ platforms tailored to your unique profile."
                },
                {
                  step: "3",
                  icon: Target,
                  title: "Apply & Track",
                  description: "Apply directly, track applications, and get insights on your job search progress all in one place."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.step}
                  </div>
                  <div className="mt-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why Choose ExpertResume Job Search?
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Join thousands of job seekers who landed their dream roles using our AI-powered platform
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Clock, title: "Save 10+ Hours Per Week", description: "Stop manually searching multiple job boards. Our AI does the heavy lifting for you." },
                { icon: Target, title: "95% Match Accuracy", description: "Get jobs that actually fit your profile, not random listings you'll never apply to." },
                { icon: TrendingUp, title: "3x More Interviews", description: "Apply to quality opportunities that match your skills, increasing interview chances." },
                { icon: Shield, title: "Privacy Protected", description: "Your data is secure. We never share your information with third parties." },
                { icon: Award, title: "Premium Experience", description: "Beautiful, modern interface designed for the best job search experience." },
                { icon: DollarSign, title: "Better Salary Offers", description: "Find hidden opportunities at top companies willing to pay what you're worth." }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                    <p className="text-blue-100 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA Section */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Crown className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join ExpertResume Premium and unlock AI-powered job search for just ₹200/month
              </p>

              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-blue-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Job Search Feature</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Unlimited job searches
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Real-time alerts & tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        20+ platform integration
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">₹200</div>
                    <div className="text-gray-600 mb-4">per month</div>
                    <button
                      onClick={() => handleCTAClick("Pricing_GetStarted")}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl"
                    >
                      Get Started Now
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Already a premium member?{" "}
                <button
                  onClick={() => handleCTAClick("Pricing_AddFeature")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Add this feature for ₹200/month
                </button>
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about AI Job Search
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  q: "How does AI job matching work?",
                  a: "Our AI analyzes your resume, extracting key details like skills, experience, job titles, and education. It then matches these against millions of job postings across 20+ platforms to find opportunities that perfectly align with your profile."
                },
                {
                  q: "Which job platforms are supported?",
                  a: "We aggregate jobs from LinkedIn, Naukri, Indeed, Glassdoor, Monster, Shine, Instahyre, AngelList, and 15+ other major job platforms, giving you access to millions of opportunities in one place."
                },
                {
                  q: "Can I track my job applications?",
                  a: "Yes! Our application tracker lets you save jobs, mark them as applied, track interview stages, and manage your entire job search pipeline in one organized dashboard."
                },
                {
                  q: "Is this feature available for free users?",
                  a: "Free users can see 2 job results to try the feature. Premium members get unlimited access to all jobs, real-time alerts, application tracking, and advanced filters."
                },
                {
                  q: "How often are jobs updated?",
                  a: "Jobs are updated in real-time. When you search, you see the latest opportunities, and our alert system notifies you instantly when new matching jobs are posted."
                },
                {
                  q: "Can I search for remote jobs?",
                  a: "Absolutely! You can filter by location, including remote, hybrid, or specific cities. Our AI understands location preferences and matches you with relevant opportunities."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-blue-50 rounded-xl p-6 border border-blue-100"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-7">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                Stop Searching. Start Finding.
              </h2>
              <p className="text-xl sm:text-2xl text-blue-100 mb-10 leading-relaxed">
                Let AI do the job hunting while you focus on preparing for interviews. 
                Your dream job is waiting.
              </p>
              <button
                onClick={() => handleCTAClick("Final_StartNow")}
                className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto group hover:scale-105"
              >
                <Sparkles className="w-6 h-6" />
                Start Your Job Search Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <p className="mt-6 text-blue-100 text-sm">
                Join 15,000+ professionals who found their dream jobs with ExpertResume
              </p>
            </motion.div>
          </div>
        </section>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <button
            onClick={() => handleCTAClick("Floating_TryNow")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl flex items-center gap-2 font-bold animate-bounce"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}

