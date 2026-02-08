"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { 
  Shield, Download, Trash2, Eye, Settings, Bell, 
  Lock, User, Mail, Phone, Calendar, FileText, 
  CheckCircle, AlertCircle, Clock, ChevronRight,
  Database, Share2, Target, Cookie
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function PrivacyDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    marketingEmails: true,
    analyticsTracking: true,
    cookieConsent: true,
    profileVisibility: "private",
    dataRetention: "standard"
  });
  const [dataRequests, setDataRequests] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid);
        await loadPrivacySettings(currentUser.uid);
        await loadDataRequests(currentUser.uid);
      } else {
        // Make page accessible without authentication - show public privacy information
        setUser(null);
        setLoading(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadPrivacySettings = async (uid) => {
    try {
      const settingsDoc = await getDoc(doc(db, "users", uid, "settings", "privacy"));
      if (settingsDoc.exists()) {
        setPrivacySettings(settingsDoc.data());
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    }
  };

  const loadDataRequests = async (uid) => {
    try {
      const requestsRef = collection(db, "users", uid, "dataRequests");
      const requestsSnapshot = await getDocs(requestsRef);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDataRequests(requests);
    } catch (error) {
      console.error("Error loading data requests:", error);
    }
  };

  const updatePrivacySettings = async (newSettings) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid, "settings", "privacy"), newSettings);
      setPrivacySettings(newSettings);
      toast.success("Privacy settings updated successfully!");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const response = await fetch("/api/export-user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );
    
    if (!confirmed) return;
    
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/delete-user-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Account deletion request submitted. You will receive a confirmation email.");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const submitDataRequest = async (requestType) => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/ccpa-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          requestType,
          email: user.email,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      toast.success(`${requestType} request submitted successfully!`);
      await loadDataRequests(user.uid);
    } catch (error) {
      console.error("Error submitting data request:", error);
      toast.error("Failed to submit request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Loading privacy dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "settings", label: "Privacy Settings", icon: Settings },
    { id: "data", label: "My Data", icon: Database },
    { id: "requests", label: "Data Requests", icon: FileText },
    { id: "rights", label: "CCPA Rights", icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Privacy Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your privacy settings and exercise your data rights
              </p>
            </div>
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-900">Account Status</p>
                        <p className="text-sm text-blue-700">Active & Verified</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-900">Data Protection</p>
                        <p className="text-sm text-blue-700">CCPA Compliant</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Lock className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-900">Encryption</p>
                        <p className="text-sm text-blue-700">256-bit SSL</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-yellow-800 font-medium">Your Privacy Rights</h3>
                      <p className="text-yellow-700 text-sm mt-1">
                        As a user, you have the right to access, correct, delete, and control how your personal 
                        information is used. Use this dashboard to exercise these rights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-3">
                      {user ? (
                        <>
                          <button
                            onClick={handleExportData}
                            disabled={isExporting}
                            className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center">
                              <Download className="h-5 w-5 text-blue-600 mr-3" />
                              <span className="text-blue-900 font-medium">Export My Data</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => submitDataRequest("access")}
                            className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <div className="flex items-center">
                              <Eye className="h-5 w-5 text-blue-600 mr-3" />
                              <span className="text-blue-900 font-medium">Request Data Access</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-blue-600" />
                          </button>
                        </>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                          Sign in to access your personal data management tools.
                        </div>
                      )}
                      <button
                        onClick={() => router.push("/ccpa-opt-out")}
                        className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <Share2 className="h-5 w-5 text-orange-600 mr-3" />
                          <span className="text-orange-900 font-medium">Opt-Out of Data Sale</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-orange-600" />
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{user ? "Data Summary" : "Privacy Information"}</h3>
                    <div className="space-y-3">
                      {user ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Created</span>
                            <span className="text-gray-900">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Login</span>
                            <span className="text-gray-900">{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data Requests</span>
                            <span className="text-gray-900">{dataRequests.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Marketing Emails</span>
                            <span className={`text-sm px-2 py-1 rounded ${privacySettings.marketingEmails ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                              {privacySettings.marketingEmails ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>• CCPA Compliant</p>
                          <p>• GDPR Ready</p>
                          <p>• 256-bit SSL Encryption</p>
                          <p>• No Data Sale to Third Parties</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                      Please <button onClick={() => router.push("/login")} className="underline font-medium">sign in</button> to manage your personal privacy settings.
                    </p>
                  </div>
                )}
                
                {user ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                          <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.marketingEmails}
                            onChange={(e) => updatePrivacySettings({
                              ...privacySettings,
                              marketingEmails: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Analytics Tracking</h3>
                        <p className="text-sm text-gray-600">Help us improve our services</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.analyticsTracking}
                          onChange={(e) => updatePrivacySettings({
                            ...privacySettings,
                            analyticsTracking: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Data Sharing</h3>
                        <p className="text-sm text-gray-600">Share data with trusted partners</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.dataSharing}
                          onChange={(e) => updatePrivacySettings({
                            ...privacySettings,
                            dataSharing: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => updatePrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Data Retention</h3>
                      <select
                        value={privacySettings.dataRetention}
                        onChange={(e) => updatePrivacySettings({
                          ...privacySettings,
                          dataRetention: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="minimal">Minimal (1 year)</option>
                        <option value="standard">Standard (3 years)</option>
                        <option value="extended">Extended (7 years)</option>
                      </select>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
                    <p className="text-gray-600 mb-4">Please sign in to manage your privacy settings.</p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "data" && (
              <>
                {!user ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
                    <p className="text-gray-600 mb-4">Please sign in to view and manage your personal data.</p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">My Data</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-900">{user?.email}</span>
                          </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account ID</span>
                        <span className="text-gray-900 font-mono text-sm">{user?.uid?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="text-gray-900">{userData?.plan || 'Free'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Data Export</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Download all your personal data in a portable format
                    </p>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      {isExporting ? "Exporting..." : "Export Data"}
                    </button>
                  </div>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-3">Danger Zone</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    {isDeletingAccount ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "requests" && (
              <>
                {!user ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
                    <p className="text-gray-600 mb-4">Please sign in to view your data requests.</p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Data Requests</h2>
                    
                    {dataRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No data requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dataRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">{request.requestType} Request</h3>
                            <p className="text-sm text-gray-600">
                              Submitted on {new Date(request.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-orange-500 mr-2" />
                            <span className="text-sm text-orange-600 capitalize">{request.status || 'pending'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "rights" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">California Consumer Privacy Act (CCPA) Rights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Right to Know</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Request information about what personal data we collect and how we use it
                    </p>
                    <button
                      onClick={() => submitDataRequest("access")}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Request Data Access
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Right to Delete</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Request deletion of your personal information from our systems
                    </p>
                    <button
                      onClick={() => submitDataRequest("deletion")}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Request Data Deletion
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Right to Opt-Out</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Opt-out of the sale of your personal information
                    </p>
                    <button
                      onClick={() => router.push("/ccpa-opt-out")}
                      className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Opt-Out of Data Sale
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Right to Portability</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Download your personal data in a portable format
                    </p>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      {isExporting ? "Exporting..." : "Export Data"}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-900 font-medium mb-2">Need Help?</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    If you have questions about your privacy rights or need assistance with a request, contact us:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="mailto:privacy@expertresume.us"
                      className="flex items-center text-blue-700 hover:text-blue-900"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      privacy@expertresume.us
                    </a>
                    <a
                      href="mailto:support@expertresume.us"
                      className="flex items-center text-blue-700 hover:text-blue-900"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      support@expertresume.us
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 