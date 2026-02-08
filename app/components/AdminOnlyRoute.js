"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { isAdminUser, isAdminOnlyRoute } from "../lib/roleBasedAccess";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Crown,
  Users,
  AlertTriangle,
  Loader2,
  ShieldOff
} from "lucide-react";

const AdminOnlyRoute = ({ children, fallback = null }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true = admin, false = team member
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Give auth context time to initialize (prevents flash of login page)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth) return; // Wait for auth to initialize

    const checkAccess = async () => {
      if (!user) {
        console.log('🔒 No user - redirecting to login');
        setLoading(false);
        setShouldRedirect(true);
        return;
      }

      console.log('✅ User authenticated, checking admin status:', user.uid);
      try {
        const adminStatus = await isAdminUser(user.uid);
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          // Team member trying to access admin-only route
          console.log("🚫 Team member blocked from admin-only route");
        } else {
          console.log("✅ Admin access granted");
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, isCheckingAuth]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/login");
    }
  }, [shouldRedirect, router]);

  // Show loading state while checking auth or admin status
  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <Crown size={32} className="text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isCheckingAuth ? "Loading Your Workspace" : "Checking Access Permissions"}
          </h3>
          <p className="text-gray-600">
            {isCheckingAuth ? "Preparing your enterprise dashboard..." : "Verifying admin access..."}
          </p>
        </motion.div>
      </div>
    );
  }

  // If not authenticated, show redirect loading
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center"
          >
            <Loader2 size={24} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Please log in to continue.</p>
        </motion.div>
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h1>
            <p className="text-gray-600 mb-6">
              This page is only accessible to admin users. Team members don't have permission to access this area.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Crown className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Admin Only</p>
                <p className="text-sm text-blue-700">This feature requires admin privileges</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-900">Team Member Access</p>
                <p className="text-sm text-green-700">You can access the dashboard and work features</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard/professional")}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </motion.button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800">
                  Need Admin Access?
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Contact your admin to request access to this feature.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // If admin, render the children
  return children;
};

export default AdminOnlyRoute;
