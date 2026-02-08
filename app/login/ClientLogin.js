"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Star, Sparkles, CheckCircle, Zap, Heart, TrendingUp, ArrowRight, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { redirectAfterLogin } from "../utils/redirectHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
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
function LoginContent() {
  const { signInWithGoogle, signInWithEmail, user, userType, isEnterpriseUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Get message from sessionStorage or URL parameters (fallback)
  useEffect(() => {
    const sessionMessage = sessionStorage.getItem('loginMessage');
    const urlMessage = searchParams.get('message');

    // Check for checkout intent from pricing page
    const redirect = searchParams.get('redirect');
    const billingCycle = searchParams.get('billingCycle');
    const currency = searchParams.get('currency');

    if (redirect === 'checkout' && billingCycle) {
      // Set checkout intent for after login
      const checkoutIntent = {
        billingCycle,
        source: 'pricing_page',
        currency: currency || 'USD'
      };
      localStorage.setItem('checkoutIntent', JSON.stringify(checkoutIntent));

      // Show secure checkout message
      setMessage(`Secure Checkout - Login to continue with your ${billingCycle} plan purchase`);
      setShowMessage(true);
    } else if (sessionMessage) {
      setMessage(sessionMessage);
      setShowMessage(true);
      // Clean up sessionStorage after reading
      sessionStorage.removeItem('loginMessage');
    } else if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage));
      setShowMessage(true);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Check if there's a return URL saved
      const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('authReturnUrl') : null;

      if (returnUrl) {
        // Clear the return URL from localStorage
        localStorage.removeItem('authReturnUrl');
        console.log('Redirecting back to:', returnUrl);
        router.push(returnUrl);
        return;
      }

      // Get user data and redirect to appropriate dashboard
      const getUserDataAndRedirect = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          const currentUserType = userData?.userType || userType || "individual";
          const currentIsEnterpriseUser = userData?.isEnterpriseUser || isEnterpriseUser || false;

          redirectAfterLogin(router, user, currentUserType, currentIsEnterpriseUser, userData, 'consumer');
        } catch (error) {
          console.error("Error redirecting user:", error);
          router.push("/dashboard"); // Fallback
        }
      };

      getUserDataAndRedirect();
    }
  }, [user, userType, isEnterpriseUser, router]);

  const handleSocialLogin = async (signInFunction, provider) => {
    if (typeof signInFunction !== "function") {
      toast.error(`Sign-in with ${provider} is unavailable.`);
      return;
    }
    try {
      setIsLoading(true);
      toast.loading(`Signing in with ${provider}...`, { id: 'social-login' });
      const result = await signInFunction();

      // Check if there's a return URL saved (user was redirected from a protected page)
      const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('authReturnUrl') : null;

      if (returnUrl) {
        localStorage.removeItem('authReturnUrl');
        toast.success(`✨ Welcome back!`, { id: 'social-login' });
        console.log('Redirecting back to:', returnUrl);
        router.push(returnUrl);
        return;
      }

      // Get user data to determine redirect
      const userDoc = await getDoc(doc(db, "users", result.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const userType = userData?.userType || "individual";
      const isEnterpriseUser = userData?.isEnterpriseUser || false;

      toast.success(`✨ Welcome back!`, { id: 'social-login' });

      // Trigger sync for extension/other tabs
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_login', Date.now().toString());
      }

      redirectAfterLogin(router, result, userType, isEnterpriseUser, userData, 'consumer');
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`, { id: 'social-login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    try {
      setIsLoading(true);
      toast.loading('Signing you in...', { id: 'email-login' });
      const result = await signInWithEmail(email, password);

      // Check if there's a return URL saved (user was redirected from a protected page)
      const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('authReturnUrl') : null;

      if (returnUrl) {
        localStorage.removeItem('authReturnUrl');
        toast.success('🎉 Welcome back!', { id: 'email-login' });
        console.log('Redirecting back to:', returnUrl);
        router.push(returnUrl);
        return;
      }

      // Get user data to determine redirect
      const userDoc = await getDoc(doc(db, "users", result.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const userType = userData?.userType || "individual";
      const isEnterpriseUser = userData?.isEnterpriseUser || false;

      toast.success('🎉 Welcome back!', { id: 'email-login' });

      // Trigger sync for extension/other tabs
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_login', Date.now().toString());
      }

      redirectAfterLogin(router, result, userType, isEnterpriseUser, userData, 'consumer');
    } catch (error) {
      console.error("Email sign-in failed:", error);
      toast.error("Invalid email or password. Please try again.", { id: 'email-login' });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, don't render the login form
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-[#0B1F3B]" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Already signed in!</h3>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast Creation",
      desc: "Build professional resumes in under 5 minutes with AI assistance"
    },
    {
      icon: TrendingUp,
      title: "ATS-Optimized Templates",
      desc: "Get past applicant tracking systems with 95% success rate"
    },
    {
      icon: Heart,
      title: "Loved by 100,000+ Users",
      desc: "Join a growing community of US job seekers"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Beautiful Gradient with Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#050F20] via-[#0B1F3B] to-[#071429] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-white/10"></div>
          <div className="absolute top-1/2 right-32 w-16 h-16 rounded-full bg-white/15"></div>
          <div className="absolute top-32 right-20 w-12 h-12 rounded-full bg-white/10"></div>
          <div className="absolute bottom-64 left-32 w-20 h-20 rounded-full bg-white/5"></div>
        </div>

        <div className="relative z-10">
          {/* Branding */}
          <div className="mb-12">
            <Link href="/" className="hover:opacity-90 transition-opacity inline-block">
              <img src="/ExpertResume.png" alt="ExpertResume" className="h-14 w-auto" width={220} height={66} />
              <p className="text-white/80 text-sm mt-2">AI Resume Builder for US Jobs</p>
            </Link>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Welcome Back to Your
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Dream Career</span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Continue your journey to landing that perfect job with AI-powered resume creation and career tools.
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
              "ExpertResume helped me land my dream job at Google! The AI suggestions were spot-on."
            </p>
            <p className="text-sm text-white/70">- Priya Sharma, Software Engineer</p>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-slate-500 to-emerald-500 text-white px-6 py-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} />
              <span className="font-semibold">Join 100,000+ Success Stories</span>
            </div>
            <p className="text-sm opacity-90">95% of our users get interview calls within 30 days!</p>
          </div>
        </div>
      </div>

      {/* Right Side - Clean Login Form */}
      <div className="flex-1 lg:w-1/2 bg-white lg:bg-white bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/" className="inline-block mb-3">
                  <img src="/ExpertResume.png" alt="ExpertResume" className="h-10 sm:h-12 w-auto" width={160} height={48} />
                </Link>
                <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900">Welcome Back!</h1>
                {showMessage && message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 via-purple-500/10 to-slate-500/10 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-slate-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-xs sm:text-sm font-semibold text-[#0B1F3B]">Secure Checkout</h3>
                            <div className="flex-shrink-0">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#0B1F3B] rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-[#071429] font-medium leading-tight">
                            {message}
                          </p>
                          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-xs text-[#071429]">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0B1F3B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-xs">Secure checkout • No hidden fees</span>
                          </div>
                        </div>
                        {/* Message Close Button */}
                        <button
                          onClick={() => setShowMessage(false)}
                          className="flex-shrink-0 p-1 text-[#0B1F3B] hover:text-[#071429] hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
                          aria-label="Close message"
                        >
                          <X size={12} className="sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  New to ExpertResume?{' '}
                  <Link href="/signup" className="text-[#0B1F3B] hover:text-[#071429] font-semibold hover:underline transition-colors">
                    Create your free account
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
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">AI Resume Builder for US Jobs</p>
                </Link>

                {/* Mobile Benefits */}
                <div
                  className="bg-gradient-to-r from-slate-50 to-slate-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Continue Your Success Journey</h3>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Zap size={14} className="sm:w-4 sm:h-4 text-[#0B1F3B]" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">5-minute resume creation</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <TrendingUp size={14} className="sm:w-4 sm:h-4 text-teal-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">95% ATS success rate</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Heart size={14} className="sm:w-4 sm:h-4 text-emerald-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">100,000+ happy users</span>
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
                  <span className="px-4 sm:px-6 bg-white lg:bg-white bg-gradient-to-r from-slate-50 via-white to-slate-50 text-gray-500 font-semibold text-xs sm:text-sm">Or sign in with email</span>
                </div>
              </div>

              {/* Email and Password Form */}
              <form
                onSubmit={handleEmailLogin}
                className="space-y-5 sm:space-y-6"
              >
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
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all duration-200 hover:border-gray-300 text-base sm:text-lg placeholder-gray-400 touch-manipulation"
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
                      placeholder="Enter your password"
                      className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0B1F3B] focus:border-[#0B1F3B] outline-none transition-all duration-200 hover:border-gray-300 text-base sm:text-lg placeholder-gray-400 touch-manipulation"
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
                <div className="flex justify-end mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm font-semibold text-[#0B1F3B] hover:text-[#071429] hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>


                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#0B1F3B] to-[#00C4B3] hover:from-[#071429] hover:to-[#008C81] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:shadow-lg touch-manipulation"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-base">Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">Sign In to Your Account</span>
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
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#0B1F3B]" />
                  <span className="font-medium">Secure Login</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#0B1F3B]" />
                  <span className="font-medium">Privacy Protected</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle size={14} className="sm:w-[18px] sm:h-[18px] text-[#0B1F3B]" />
                  <span className="font-medium">Free Tier Available</span>
                </div>
              </div>

              {/* Enterprise Login Link Removed */}

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
                  "ExpertResume helped me land my dream job! The AI suggestions were amazing."
                </p>
                <p className="text-sm text-gray-600">- Priya S., Software Engineer</p>
              </div>

              <p
                className="text-xs text-center text-gray-500 mt-6"
              >
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-[#0B1F3B] hover:underline font-semibold">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#0B1F3B] hover:underline font-semibold">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}

import LoginSkeleton from "../components/LoginSkeleton";

// Main export component with Suspense boundary
export default function ClientLogin() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}