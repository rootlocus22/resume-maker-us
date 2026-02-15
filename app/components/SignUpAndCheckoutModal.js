import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { X, Sparkles, Check, Crown, Lock } from "lucide-react";
import { getEffectivePricing } from "../lib/globalPricing";
import { useLocation } from "../context/LocationContext";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const SignUpAndCheckoutModal = ({ isOpen, onClose, billingCycle, setBillingCycle, currency, user, onAuthSuccess, source }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const router = useRouter();
  const { currency: currentCurrency, isLoading: isLoadingGeo } = useLocation();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.userAgent) {
      setIsAndroidDevice(/Android/i.test(navigator.userAgent));
    }
  }, []);
  const pricing = getEffectivePricing(currentCurrency, isAndroidDevice);

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
      setIsSignedUp(true);
      toast.success("Account created successfully!");
      if (typeof onAuthSuccess === 'function') onAuthSuccess();
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
      setIsSignedUp(true);
      toast.success("Signed up with Google!");
      if (typeof onAuthSuccess === 'function') onAuthSuccess();
    } catch (error) {
      console.error("Google Sign-up Error:", error);
      toast.error(error.message || "Failed to sign up with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user && !isSignedUp) {
      toast.error("Please sign up first.");
      return;
    }
    setIsLoading(true);
    try {
      const checkoutUrl = source ? `/checkout?billingCycle=monthly&currency=${currency}&source=${source}` : `/checkout?billingCycle=monthly&currency=${currency}`;
      router.push(checkoutUrl);
    } catch (error) {
      toast.error("Failed to initiate checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 px-4 py-6"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
              {user || isSignedUp ? "Unlock Premium Features" : "Start Your Success Story"}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm">
              Join thousands of successful job seekers who landed their dream jobs
            </p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={20} className="md:size-8" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6">
          {!(user || isSignedUp) ? (
            <div className="space-y-3 md:space-y-4 mb-4">
              <div className="bg-accent-50 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-accent" size={16} />
                  <h3 className="font-semibold text-primary text-sm md:text-base">Why Join Us?</h3>
                </div>
                <ul className="space-y-2 text-xs md:text-sm text-primary">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent" />
                    <span>ATS-optimized resume templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent" />
                    <span>AI-powered content enhancement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-accent" />
                    <span>Unlimited downloads & edits</span>
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 md:py-3 rounded-lg font-bold shadow-md hover:from-primary-800 hover:to-accent-600 transition-all disabled:opacity-70 text-sm md:text-base"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Create Your Account"}
              </button>
              <div className="flex items-center gap-2 my-3 md:my-4">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="text-xs md:text-sm text-gray-600">or</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>
              <button
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-70 text-sm md:text-base"
                disabled={isLoading}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-gradient-to-r from-accent-50 to-accent-50 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <Crown className="text-yellow-500" size={20} />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Premium Features</h3>
                </div>
                <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">ATS Optimization</span>
                      <p className="text-gray-600">Get past applicant tracking systems</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">AI Content Enhancement</span>
                      <p className="text-gray-600">Professional content suggestions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Premium Templates</span>
                      <p className="text-gray-600">Stand out with beautiful designs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Unlimited Downloads</span>
                      <p className="text-gray-600">Download as many versions as you need</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Conversational AI Interview Trainer</span>
                      <p className="text-gray-600">Practice with AI to ace your interviews</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Unlimited AI Queries Problem Solver</span>
                      <p className="text-gray-600">Solve complex problems with AI assistance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-accent mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Upcoming AI Curated Courses</span>
                      <p className="text-gray-600">Access tailored learning paths to boost your skills</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Monthly Plan</span>
                  <span className="text-base md:text-lg font-bold text-gray-900">{pricing.monthly}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Annual Plan</span>
                  <div className="text-right">
                    <span className="text-base md:text-lg font-bold text-gray-900">{pricing.yearly}/yr</span>
                    <span className="block text-[10px] md:text-xs text-accent font-medium">Save 20%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!(user || isSignedUp) ? null : (
          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <button
              onClick={handlePurchase}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 md:py-4 rounded-xl font-bold shadow-lg hover:from-primary-800 hover:to-accent-600 transition-all disabled:opacity-70 text-base md:text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Get Premium Access Now"}
            </button>
            <div className="text-center mt-2">
              <p className="text-xs md:text-sm text-gray-500">
                <Lock size={12} className="inline mr-1" />
                Secure payment • One-time payment only • No subscriptions
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SignUpAndCheckoutModal;
