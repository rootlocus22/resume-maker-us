"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocation } from "../context/LocationContext";
import { getEffectivePricing, formatPrice } from "../lib/globalPricing";

// Custom Google Icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Utility to detect mobile iOS
function isMobileIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export default function LoginAndSubscribeModal({ isOpen, onClose, billingCycle = "trial" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIOSMobile, setIsIOSMobile] = useState(false);
  const router = useRouter();
  const { currency, isLoadingGeo } = useLocation();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      setIsAndroidDevice(/Android/i.test(navigator.userAgent));
    }
  }, []);

  const pricing = getEffectivePricing(currency, isAndroidDevice);

  // Log invalid billingCycle to Firestore for debugging
  if (!["trial", "monthly", "sixMonth", "yearly"].includes(billingCycle)) {
    setDoc(doc(db, "debug_logs", `${Date.now()}`), {
      eventType: "invalid_billing_cycle",
      message: `Invalid billingCycle: ${billingCycle}, defaulted to ${pricing.effectiveBillingCycle}`,
      userId: auth.currentUser?.uid || "anonymous",
      timestamp: new Date().toISOString(),
    }).catch((error) => console.error("Failed to log debug event:", error));
  }

  const handleEmailSignUp = async () => {
    if (!name || !email || !password || password.length < 6) {
      toast.error("Please provide a valid name, email, and password (min 6 characters).");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      }, { merge: true }); // IMPORTANT: merge: true to preserve referral data
      toast.success("Account created successfully!");
      router.push(`/checkout?billingCycle=${pricing.effectiveBillingCycle}¤cy=${currency}`);
    } catch (error) {
      console.error("Sign-up Error:", error);
      toast.error(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: userCredential.user.displayName || "User",
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("Signed up with Google!");
      router.push(`/checkout?billingCycle=${pricing.effectiveBillingCycle}¤cy=${currency}`);
    } catch (error) {
      console.error("Google Sign-up Error:", error);
      toast.error(error.message || "Failed to sign up with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || isLoadingGeo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sign Up to Unlock Premium</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleEmailSignUp}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-lg font-bold shadow-md hover:from-blue-700 hover:to-blue-700 transition-all disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Sign Up for ${pricing.basicPrice} (7 days)`}
          </button>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="text-sm text-gray-600">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          <button
            onClick={handleGoogleSignUp}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-70"
            disabled={isLoading}
          >
            <GoogleIcon />
            Sign Up with Google
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our <a href="/terms" className="underline hover:text-gray-700">Terms</a> and{" "}
          <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
        </p>
        <p className="text-xs text-gray-400 text-center mt-2">
          {pricing.effectiveBillingCycle === "trial" ? `Special Android pricing: ${formatPrice(pricing.basic, currency)} for 7 days` : `Desktop/iOS pricing: ${formatPrice(pricing.monthly, currency)} for 30 days`}
        </p>
      </div>
    </motion.div>
  );
}