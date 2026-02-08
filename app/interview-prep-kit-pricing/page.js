"use client";
import { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle,
  Sparkles,
  Target,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Crown,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const PRICING_OPTIONS = [
  {
    id: "single",
    name: "Single Interview",
    price: 199,
    credits: 1,
    description: "Perfect for one upcoming interview",
    popular: false,
    features: [
      "20 likely interview questions",
      "Personalized answers from your resume",
      "Question categories & tips",
      "Downloadable PDF guide",
      "Valid for 30 days",
    ],
  },
  {
    id: "pack_5",
    name: "Interview Pack",
    price: 799,
    credits: 5,
    description: "Best for active job seekers",
    popular: true,
    savings: "Save ₹196",
    pricePerInterview: "₹160 per interview",
    features: [
      "5 interview prep kits",
      "20 questions each",
      "Personalized answers",
      "Downloadable PDF guides",
      "Valid for 90 days",
      "Priority support",
    ],
  },
  {
    id: "pack_10",
    name: "Career Booster",
    price: 1299,
    credits: 10,
    description: "Maximum value for career changers",
    popular: false,
    savings: "Save ₹691",
    pricePerInterview: "₹130 per interview",
    features: [
      "10 interview prep kits",
      "20 questions each",
      "Personalized answers",
      "Downloadable PDF guides",
      "Valid for 180 days",
      "Priority support",
      "Bonus: Interview tips guide",
    ],
  },
];

export default function InterviewPrepKitPricing() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("pack_5");
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/interview-prep-kit-pricing");
      return;
    }

    // Fetch user's remaining credits
    const fetchCredits = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setRemainingCredits(data.interviewCheatsheetsRemaining || 0);
      }
    };

    fetchCredits();
  }, [user, router]);

  const handlePurchase = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const selectedOption = PRICING_OPTIONS.find((opt) => opt.id === selectedPlan);

      // Create Stripe Checkout Session
      const orderResponse = await fetch("/api/create-interview-cheatsheet-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          credits: selectedOption.credits,
          amount: selectedOption.price * 100, // Convert to cents
          currency: "USD",
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || "User",
          origin: typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await orderResponse.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to initiate purchase. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 sm:py-12 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Brain className="w-4 h-4" />
            Interview Preparation Made Easy
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ace Every Interview with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI-Powered </span>
            Prep Kits
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Get 20 likely interview questions with perfect answers tailored to your resume.
            Be prepared, confident, and land your dream job!
          </p>

          {remainingCredits > 0 && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              You have {remainingCredits} credit{remainingCredits !== 1 ? 's' : ''} remaining
            </div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PRICING_OPTIONS.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                option.popular ? "ring-2 ring-blue-600" : ""
              }`}
            >
              {option.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {option.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {option.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{option.price}
                    </span>
                    <span className="text-gray-500 text-sm">
                      / {option.credits} credit{option.credits !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {option.pricePerInterview && (
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {option.pricePerInterview}
                    </p>
                  )}
                  {option.savings && (
                    <div className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mt-2">
                      {option.savings}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedPlan(option.id);
                    handlePurchase();
                  }}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-bold transition-all mb-6 ${
                    option.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && selectedPlan === option.id ? "Processing..." : "Buy Now"}
                </button>
                
                <ul className="space-y-3">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Interview Prep Kits Work
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered",
                description: "Advanced AI analyzes job descriptions and generates relevant questions",
                color: "blue",
              },
              {
                icon: Target,
                title: "Personalized",
                description: "Answers tailored to your specific experience and skills",
                color: "indigo",
              },
              {
                icon: Zap,
                title: "Time-Saving",
                description: "Get prepared in minutes, not hours of research",
                color: "purple",
              },
              {
                icon: TrendingUp,
                title: "Proven Results",
                description: "Used by 10,000+ job seekers to land their dream roles",
                color: "green",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className={`w-8 h-8 text-${benefit.color}-600`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 sm:p-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6 max-w-3xl mx-auto">
            {[
              {
                q: "How does the Interview Prep Kit work?",
                a: "Simply paste a job description, and our AI will analyze it to generate 20 likely interview questions. If you provide your resume, we'll personalize the answers to match your experience.",
              },
              {
                q: "Can I use it for multiple interviews?",
                a: "Yes! Each credit gives you one complete prep kit. Buy packs to prepare for multiple interviews and save money.",
              },
              {
                q: "How accurate are the questions?",
                a: "Our AI analyzes thousands of real interview patterns and job requirements. The questions are highly relevant and commonly asked for each specific role.",
              },
              {
                q: "What if I'm not satisfied?",
                a: "We offer a 100% satisfaction guarantee. If you're not happy with your prep kit, contact us for a refund within 7 days.",
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

