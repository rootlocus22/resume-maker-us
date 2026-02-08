"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { Search, User, Mail, Key, LogIn, Shield, AlertCircle, Loader2, UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'rahuldubey220890@gmail.com';

export default function LoginAsUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('email'); // 'email' or 'userId'
  const [loading, setLoading] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null); // null = checking, true = authorized, false = not authorized

  // Check if current user is admin
  useEffect(() => {
    if (user) {
      if (user.email === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    setUserResult(null);

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      const response = await fetch('/api/admin/login-as-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          searchQuery: searchQuery.trim(),
          searchType: searchType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search user');
      }

      setUserResult(data);
      toast.success('User found successfully!');
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search user');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAsUser = async () => {
    if (!userResult?.customToken) {
      toast.error('No custom token available');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with custom token
      const userCredential = await signInWithCustomToken(auth, userResult.customToken);
      
      toast.success(`Successfully logged in as ${userResult.user.email}`);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login as user');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              This page is only accessible to the admin account.
            </p>
            {!user ? (
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Login As User</h1>
                <p className="text-sm text-gray-600">Admin tool for user support and issue resolution</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>This tool allows you to impersonate users for support purposes only.</span>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search User</h2>
            
            <div className="space-y-4">
              {/* Search Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType('email')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Search by Email
                </button>
                <button
                  onClick={() => setSearchType('userId')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'userId'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Key className="w-4 h-4 inline mr-2" />
                  Search by User ID
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={searchType === 'email' ? 'Enter user email' : 'Enter user ID'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* User Result */}
          {userResult && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Found</h2>
              
              {/* User Info */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Display Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{userResult.user.displayName}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Email</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{userResult.user.email}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">User ID</span>
                    </div>
                    <p className="text-sm font-mono text-gray-900 break-all">{userResult.user.uid}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Plan</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{userResult.userData.plan}</p>
                  </div>
                </div>

                {/* Profile Slots */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Profile Slots</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {userResult.userData.profileSlots} additional slot(s) purchased
                  </p>
                </div>

                {/* Active Profiles */}
                {userResult.activeProfiles && userResult.activeProfiles.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Active Profiles ({userResult.activeProfiles.length})</span>
                    </div>
                    <div className="space-y-2">
                      {userResult.activeProfiles.map((profile, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                          <p className="font-semibold text-gray-900">{profile.name || 'N/A'}</p>
                          {profile.email && (
                            <p className="text-sm text-gray-600">{profile.email}</p>
                          )}
                          {profile.phone && (
                            <p className="text-sm text-gray-600">{profile.phone}</p>
                          )}
                          {profile.storedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Added: {new Date(profile.storedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Login Button */}
              <button
                onClick={handleLoginAsUser}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login As This User
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
  );
}

