"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Star, Sparkles, CheckCircle, Zap, Heart, TrendingUp, ArrowRight, X, Users, Award, Rocket } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { event } from "../lib/gtag";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Custom Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);



// Component that uses useSearchParams - needs to be wrapped in Suspense
function SignupContent() {
  const { signInWithGoogle, signUpWithEmail, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Get message from sessionStorage or URL parameters (fallback)
  useEffect(() => {
    const sessionMessage = sessionStorage.getItem('signupMessage');
    const urlMessage = searchParams.get('message');

    if (sessionMessage) {
      setMessage(sessionMessage);
      setShowMessage(true);
      // Clean up sessionStorage after reading
      sessionStorage.removeItem('signupMessage');
    } else if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage));
      setShowMessage(true);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const sendWelcomeEmail = (userId) => {
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "welcome",
        userId: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Welcome email sent:", data);
        toast.success("Welcome Kit email sent! Check your inbox.");
      })
      .catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
  };

  const handleSocialLogin = async (signInFunction, provider) => {
    if (typeof signInFunction !== "function") {
      toast.error(`Sign-up with ${provider} is unavailable.`);
      return;
    }
    try {
      setIsLoading(true);
      toast.loading(`Creating your account with ${provider}...`, { id: 'social-signup' });

      // IMPORTANT: Store referral code BEFORE signup so onAuthStateChanged can use it
      const referralCode = searchParams.get('ref');
      if (referralCode) {
        sessionStorage.setItem('pendingReferralCode', referralCode);
      }

      const result = await signInFunction();
      const userId = result?.uid;

      // Track referral if present (this is a backup, main tracking happens in onAuthStateChanged)
      if (referralCode && userId) {
        try {
          await fetch('/api/track-referral-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              referralCode,
              email: result?.email
            })
          });
        } catch (refError) {
          console.error('Error tracking referral:', refError);
        }
      }

      // Clean up
      sessionStorage.removeItem('pendingReferralCode');

      event({
        action: "user_sign_up",
        category: "Authentication",
        label: provider,
      });
      setTimeout(() => { sendWelcomeEmail(userId) }, 3000);

      toast.success(`🎉 Welcome to ExpertResume!`, { id: 'social-signup' });

      // Check for checkout intent
      const checkoutIntent = localStorage.getItem('checkoutIntent');
      if (checkoutIntent) {
        try {
          const { billingCycle, source } = JSON.parse(checkoutIntent);
          localStorage.removeItem('checkoutIntent'); // Clean up
          console.log(`Redirecting new user to checkout - source: ${source}, billingCycle: ${billingCycle}`);
          router.push(`/checkout?billingCycle=${billingCycle}&source=${source}`);
          return;
        } catch (error) {
          console.error('Error parsing checkout intent:', error);
          localStorage.removeItem('checkoutIntent'); // Clean up corrupted data
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(`${provider} sign-up failed:`, error);
      toast.error(`Failed to sign up with ${provider}. Please try again.`, { id: 'social-signup' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setIsLoading(true);
      toast.loading('Creating your free account...', { id: 'email-signup' });

      // IMPORTANT: Store referral code BEFORE signup so onAuthStateChanged can use it
      const referralCode = searchParams.get('ref');
      if (referralCode) {
        sessionStorage.setItem('pendingReferralCode', referralCode);
      }

      const result = await signUpWithEmail(email, password, name);
      const userId = result?.uid;

      // Track referral if present (this is a backup, main tracking happens in onAuthStateChanged)
      if (referralCode && userId) {
        try {
          await fetch('/api/track-referral-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              referralCode,
              email: email
            })
          });
        } catch (refError) {
          console.error('Error tracking referral:', refError);
        }
      }

      // Clean up
      sessionStorage.removeItem('pendingReferralCode');

      event({
        action: "user_sign_up",
        category: "Authentication",
        label: "Email",
      });
      setTimeout(() => { sendWelcomeEmail(userId) }, 3000);
      toast.success('🎉 Account created! Welcome to ExpertResume!', { id: 'email-signup' });

      // Check for checkout intent
      const checkoutIntent = localStorage.getItem('checkoutIntent');
      if (checkoutIntent) {
        try {
          const { billingCycle, source } = JSON.parse(checkoutIntent);
          localStorage.removeItem('checkoutIntent'); // Clean up
          console.log(`Redirecting new user to checkout - source: ${source}, billingCycle: ${billingCycle}`);
          router.push(`/checkout?billingCycle=${billingCycle}&source=${source}`);
          return;
        } catch (error) {
          console.error('Error parsing checkout intent:', error);
          localStorage.removeItem('checkoutIntent'); // Clean up corrupted data
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Email sign-up failed:", error);
      toast.error("Failed to create account. Please try again.", { id: 'email-signup' });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, don't render the signup form
  if (user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-[#2563EB]" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Already have an account!</h3>
          <p className="text-gray-600">Taking you to the resume builder...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Rocket,
      title: "Get Started in 30 Seconds",
      desc: "Create your first professional resume instantly with our AI-powered builder"
    },
    {
      icon: Award,
      title: "ATS-Friendly Templates",
      desc: "Choose from 50+ recruiter-approved templates that get you interviews"
    },
    {
      icon: Users,
      title: "Join 100,000+ Success Stories",
      desc: "Trusted by US professionals for ATS-optimized resumes and career tools"
    }
  ];

  const features = [
    "50+ Professional Templates",
    "AI-Powered Content Suggestions",
    "ATS Score Checker",
    "One-Click Download",
    "Cover Letter Builder",
    "LinkedIn Profile Optimizer"
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - US SaaS theme (Deep Navy + accent) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-40 h-40 rounded-full bg-white/20"></div>
          <div className="absolute bottom-24 right-12 w-32 h-32 rounded-full bg-white/15"></div>
          <div className="absolute top-1/3 right-24 w-24 h-24 rounded-full bg-white/10"></div>
          <div className="absolute top-64 right-16 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-48 left-24 w-28 h-28 rounded-full bg-white/5"></div>
          <div className="absolute top-80 left-8 w-20 h-20 rounded-full bg-white/15"></div>
        </div>

        <div className="relative z-10">
          {/* Branding */}
          <div className="mb-12">
            <Link href="/" className="hover:opacity-90 transition-opacity inline-block">
              <img src="/ExpertResume.png" alt="ExpertResume" className="h-14 w-auto" width={220} height={66} />
              <p className="text-white/80 text-sm mt-2">Transform Your Career Journey</p>
            </Link>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Start Your
              <span className="text-[#60A5FA]"> Success Story</span>
              <br />Today
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of professionals who landed their dream jobs with AI-powered resumes that get results.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <benefit.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-white/80">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What's Included */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              Everything you need to get hired:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle size={14} className="text-blue-300 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10">
          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 font-semibold">4.9/5 Rating</span>
            </div>
            <p className="text-white/90 mb-4 italic">
              "Got 3 interview calls in the first week! ExpertResume's templates are absolutely amazing."
            </p>
            <p className="text-sm text-white/70">- James Wilson, Marketing Manager</p>
          </div>

          {/* CTA */}
          <div className="bg-[#2563EB] text-white px-6 py-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} />
              <span className="font-semibold">Free to Start</span>
            </div>
            <p className="text-sm opacity-90">Start with our free tier — upgrade anytime!</p>
          </div>
        </div>
      </div>

      {/* Right Side - Clean Signup Form (US SaaS soft gray bg) */}
      <div className="flex-1 lg:w-1/2 bg-white lg:bg-[#F8FAFC]">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/" className="inline-block mb-3">
                  <img src="/ExpertResume.png" alt="ExpertResume" className="h-10 sm:h-12 w-auto" width={160} height={48} />
                </Link>
                <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900">Create Your Free Account</h1>
                {showMessage && message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-green-900">Get Started!</h3>
                            <div className="flex-shrink-0">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm lg:text-base text-green-800 font-medium leading-relaxed">
                            {message}
                          </p>
                          <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2 text-xs lg:text-sm text-green-700">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-xs sm:text-sm">Free account • Premium features • No credit card required</span>
                          </div>
                        </div>
                        {/* Message Close Button */}
                        <button
                          onClick={() => setShowMessage(false)}
                          className="flex-shrink-0 p-1.5 sm:p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors touch-manipulation"
                          aria-label="Close message"
                        >
                          <X size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#2563EB] hover:text-[#1d4ed8] font-semibold hover:underline transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors p-2 touch-manipulation">
                <X size={20} className="sm:w-6 sm:h-6" />
              </Link>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-center">
            <div
              className="max-w-md mx-auto w-full"
            >
              {/* Mobile Hero Section */}
              <div className="lg:hidden text-center mb-8 sm:mb-10">
                <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
                  <img src="/ExpertResume.png" alt="ExpertResume" className="h-12 sm:h-14 w-auto mx-auto" width={200} height={60} />
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Transform Your Career Journey</p>
                </Link>

                {/* Mobile Benefits */}
                <div
                  className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Start Your Success Story</h3>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2563EB]/10 rounded-lg flex items-center justify-center">
                        <Rocket size={14} className="sm:w-4 sm:h-4 text-[#2563EB]" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Get started in 30 seconds</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#2563EB]/10 rounded-lg flex items-center justify-center">
                        <Award size={14} className="sm:w-4 sm:h-4 text-[#2563EB]" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">50+ ATS-friendly templates</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                        <Users size={14} className="sm:w-4 sm:h-4 text-[#0D9488]" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Join 100,000+ success stories</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Buttons */}
              <div
                className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
              >
                <div
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3"
                >
                  <button
                    onClick={() => handleSocialLogin(signInWithGoogle, "Google")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-4 px-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-70 hover:border-gray-400 hover:shadow-md active:shadow-sm touch-manipulation"
                  >
                    <GoogleIcon />
                    <span className="font-semibold text-gray-700 text-sm sm:text-base">Continue with Google</span>
                  </button>
                </div>
              </div>

              <div
                className="relative mb-6 sm:mb-8"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 sm:px-6 bg-[#F8FAFC] text-[#475569] font-semibold text-xs sm:text-sm">Or create account with email</span>
                </div>
              </div>

              {/* Name, Email, and Password Form */}
              <form
                onSubmit={handleEmailSignup}
                className="space-y-5 sm:space-y-6"
              >
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <User className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none transition-all duration-200 hover:border-[#E5E7EB] text-base sm:text-lg placeholder-[#475569] touch-manipulation"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none transition-all duration-200 hover:border-[#E5E7EB] text-base sm:text-lg placeholder-[#475569] touch-manipulation"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none transition-all duration-200 hover:border-[#E5E7EB] text-base sm:text-lg placeholder-[#475569] touch-manipulation"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 touch-manipulation"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:shadow-md touch-manipulation"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-base">Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">Create Free Account</span>
                      <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Indicators */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#2563EB]" />
                  <span className="font-medium">Free Tier Available</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#2563EB]" />
                  <span className="font-medium">No Credit Card</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#0D9488]" />
                  <span className="font-medium">Instant Access</span>
                </div>
              </div>

              <p
                className="text-xs text-center text-gray-500 mt-4 sm:mt-6"
              >
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-[#2563EB] hover:underline font-semibold">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#2563EB] hover:underline font-semibold">Privacy Policy</Link>
              </p>

              {/* What happens next section */}
              <div
                className="mt-8 p-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl"
              >
                <h4 className="text-lg font-bold text-[#020617] mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#2563EB]" />
                  What happens next?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2563EB]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#2563EB] font-bold text-sm">1</span>
                    </div>
                    <span className="text-gray-700 font-medium">Choose from 50+ professional templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2563EB]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#2563EB] font-bold text-sm">2</span>
                    </div>
                    <span className="text-gray-700 font-medium">AI helps you write compelling content</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0D9488]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0D9488] font-bold text-sm">3</span>
                    </div>
                    <span className="text-gray-700 font-medium">Download your perfect resume in minutes</span>
                  </div>
                </div>
              </div>

              {/* Mobile Testimonial */}
              <div
                className="lg:hidden bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mt-8"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current" />
                  ))}
                  <span className="ml-2 font-bold text-gray-800">4.9/5</span>
                </div>
                <p className="text-gray-700 mb-3 italic font-medium">
                  "Got 3 interview calls in the first week! ExpertResume's templates are amazing."
                </p>
                <p className="text-sm text-gray-600">- James W., Marketing Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function SignupLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
        <p className="text-gray-600">Preparing your signup page</p>
      </div>
    </div>
  );
}

// Main export component with Suspense boundary
export default function ClientSignup() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupContent />
    </Suspense>
  );
}