"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import {
  Crown,
  CheckCircle,
  Briefcase,
  Target,
  Bell,
  BarChart,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  Lock
} from "lucide-react";

const JobTrackerPricingClient = () => {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasJobTrackerFeature = userData?.hasJobTrackerFeature || false;

  const jobTrackerPlans = [
    {
      basePlan: "Expert Plan",
      baseDuration: "90 days",
      basePrice: 599, // Anchor price
      withJobsPrice: 399,
      savings: 200,
      billingCycle: "quarterly",
      popular: true,
      description: "Everything you need for a successful job hunt."
    },
    {
      basePlan: "Ultimate Plan",
      baseDuration: "180 days",
      basePrice: 89900, // Anchor price
      withJobsPrice: 699,
      savings: 200,
      billingCycle: "sixMonth",
      description: "Complete career toolkit + Interview Pro access."
    }
  ];

  const jobTrackerFeatures = [
    { icon: <Briefcase />, text: "Access 100+ AI-curated jobs per day", highlight: true },
    { icon: <Target />, text: "Smart job matching based on your resume", highlight: true },
    { icon: <Bell />, text: "Real-time alerts for new matching opportunities", highlight: true },
    { icon: <BarChart />, text: "Track application status & follow-ups", highlight: true },
    { icon: <TrendingUp />, text: "Job market insights & salary trends", highlight: true },
    { icon: <Sparkles />, text: "AI-powered application tips for each job", highlight: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            NOW BUNDLED: Job Search Included in Pro Plans
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Not Just Build Resumes,
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Help You Land Jobs Too!
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Advanced Job Search tools are now <span className="font-bold text-purple-600">Included</span> in our Quarterly and 6-Month plans. No more separate add-ons!
          </p>

          {hasJobTrackerFeature && (
            <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold mb-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              You have Job Tracker access!
            </div>
          )}
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What's Included in Job Tracker?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTrackerFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div className="flex-shrink-0 text-purple-600">
                  {React.cloneElement(feature.icon, { className: "w-6 h-6" })}
                </div>
                <p className="text-gray-700 font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Plan with Job Tracker
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobTrackerPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? "ring-4 ring-purple-500 scale-105" : ""
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.basePlan} + Jobs
                  </h3>
                  <p className="text-gray-600">{plan.baseDuration} access</p>
                </div>

                {/* Price Comparison */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-500 line-through text-lg">₹{plan.basePrice}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                      +₹{plan.savings}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.withJobsPrice}</span>
                    <span className="text-gray-600">/{plan.baseDuration}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>All {plan.basePlan} Features</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <span>20+ AI-Curated Jobs</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Job Application Tracker</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span>New Job Alerts</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/checkout?billingCycle=${plan.billingCycle}&addJobTracker=true`}>
                  <button className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    }`}>
                    {hasJobTrackerFeature ? (
                      <>
                        <Zap className="w-5 h-5" />
                        Extend with Job Tracker
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Why Users Love Job Tracker
            </h3>
            <p className="text-gray-600">
              Join thousands of job seekers who are landing jobs faster with ExpertResume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">3x</div>
              <p className="text-gray-700">More interview callbacks</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">50%</div>
              <p className="text-gray-700">Faster job search</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <p className="text-gray-700">User satisfaction rate</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How Job Tracker Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Set Your Profile</h4>
              <p className="text-gray-600 text-sm">Tell us your job title, industry, and location</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get AI Matches</h4>
              <p className="text-gray-600 text-sm">Our AI finds 20+ relevant jobs for you</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Apply & Track</h4>
              <p className="text-gray-600 text-sm">Track all applications in one place</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Land Your Job</h4>
              <p className="text-gray-600 text-sm">Get hired faster with our tools</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">How is this different from other job portals?</h4>
              <p className="text-gray-600">
                Unlike generic job portals, our AI analyzes YOUR resume and finds jobs specifically matching your skills, experience, and preferences. Plus, you get application tracking and personalized tips.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Can I add Job Tracker to my existing plan?</h4>
              <p className="text-gray-600">
                Yes! If you're already on a premium plan, you can upgrade to add Job Tracker for just ₹200 more.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">How often are jobs updated?</h4>
              <p className="text-gray-600">
                Our AI searches for new jobs in real-time. You'll get alerts whenever new matching opportunities are found.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Is this available in my location?</h4>
              <p className="text-gray-600">
                Yes! Job Tracker works across all major cities in India. Simply set your preferred location and we'll find opportunities near you.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are finding jobs faster with ExpertResume's Job Tracker
          </p>
          <Link href={hasJobTrackerFeature ? "/jobs-nearby" : "/pricing"}>
            <button className="bg-white text-purple-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center gap-2 shadow-xl">
              {hasJobTrackerFeature ? (
                <>
                  <Briefcase className="w-6 h-6" />
                  Browse Jobs Now
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6" />
                  Get Started Today
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobTrackerPricingClient;

