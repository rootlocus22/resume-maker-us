'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lock, Unlock, Download, Edit, Eye, Copy, Search, ExternalLink, Calendar, Filter, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, DollarSign, CreditCard, AlertTriangle } from 'lucide-react';

const PAGE_SIZE = 12;

export default function HostedResumesAdmin() {
  const [hostedResumes, setHostedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [agentNames, setAgentNames] = useState({});
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month', 'all', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'locked', 'disabled', 'paid', 'pending_payment', 'failed_payment', 'no_payment'
  const { user, loading: isLoading } = useAuth();
  const router = useRouter();

  const checkAdminStatus = async (currentUser) => {
    if (!currentUser) return false;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        return data.agent_admin === true;
      }
      return false;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    checkAdminStatus(user).then((adminStatus) => {
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        router.push('/my-resumes');
        return;
      }

      fetchHostedResumes();
    });
  }, [user, isLoading, router]);

  const fetchHostedResumes = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();

      const response = await fetch('/api/admin/hosted-resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch hosted resumes');
      }

      const data = await response.json();
      const resumes = data.hostedResumes || [];
      setHostedResumes(resumes);
      await loadAgentNames(resumes);
    } catch (err) {
      console.error('Error fetching hosted resumes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentNames = async (resumes) => {
    try {
      const uniqueAgentIds = Array.from(
        new Set(resumes.map((resume) => resume.sourceUserId).filter(Boolean))
      );

      if (uniqueAgentIds.length === 0) return;

      const entries = await Promise.all(
        uniqueAgentIds.map(async (agentId) => {
          try {
            const userRef = doc(db, 'users', agentId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const data = userDoc.data();
              const agentName =
                data.displayName ||
                data.fullName ||
                data.name ||
                data.email ||
                'Unknown Agent';
              return [agentId, agentName];
            }
          } catch (err) {
            console.error('Error fetching agent info:', err);
          }
          return [agentId, 'Unknown Agent'];
        })
      );

      setAgentNames((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    } catch (err) {
      console.error('Failed to load agent names:', err);
    }
  };

  const toggleDownloadPermission = async (hostedId, currentStatus) => {
    try {
      const token = await user.getIdToken();

      const response = await fetch(`/api/admin/hosted-resume/${hostedId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          downloadEnabled: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update download permission');
      }

      setHostedResumes((prev) =>
        prev.map((resume) =>
          resume.hostedId === hostedId
            ? { ...resume, downloadEnabled: !currentStatus }
            : resume
        )
      );
    } catch (err) {
      console.error('Error updating download permission:', err);
      alert('Failed to update download permission');
    }
  };

  const toggleLockStatus = async (hostedId, currentStatus) => {
    try {
      const token = await user.getIdToken();

      const response = await fetch(`/api/admin/hosted-resume/${hostedId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locked: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lock status');
      }

      setHostedResumes((prev) =>
        prev.map((resume) =>
          resume.hostedId === hostedId ? { ...resume, locked: !currentStatus } : resume
        )
      );
    } catch (err) {
      console.error('Error updating lock status:', err);
      alert('Failed to update lock status');
    }
  };

  const toggleEditEnabled = async (hostedId, currentStatus) => {
    try {
      const token = await user.getIdToken();

      const response = await fetch(`/api/admin/hosted-resume/${hostedId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          editEnabled: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update edit permission');
      }

      setHostedResumes((prev) =>
        prev.map((resume) =>
          resume.hostedId === hostedId ? { ...resume, editEnabled: !currentStatus } : resume
        )
      );
    } catch (err) {
      console.error('Error updating edit permission:', err);
      alert('Failed to update edit permission');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return 'Unknown';
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDate(dateString);
    } catch (err) {
      return 'Unknown';
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      const toast = document.createElement('div');
      toast.className =
        'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = '✓ URL copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const isDateInRange = (dateString, filterType) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      switch (filterType) {
        case 'today':
          return dateOnly.getTime() === today.getTime();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return date >= monthAgo;
        case 'custom':
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return date >= start && date <= end;
        case 'all':
        default:
          return true;
      }
    } catch (err) {
      return false;
    }
  };

  const enrichedResumes = useMemo(() => {
    return hostedResumes.map((resume) => ({
      ...resume,
      agentName: agentNames[resume.sourceUserId] || 'Unknown Agent',
      resumeNameComparable: (resume.resumeName || '').toLowerCase(),
    }));
  }, [hostedResumes, agentNames]);

  const filteredResumes = useMemo(() => {
    let filtered = enrichedResumes;

    // Apply date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter((resume) => isDateInRange(resume.createdAt, dateFilter));
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((resume) => {
        switch (statusFilter) {
          case 'active':
            return resume.downloadEnabled && !resume.locked;
          case 'locked':
            return resume.locked;
          case 'disabled':
            return !resume.downloadEnabled;
          case 'paid':
            return resume.successfulPayment || resume.paymentStatus === 'paid';
          case 'pending_payment':
            return resume.pendingPayment && !resume.successfulPayment;
          case 'failed_payment':
            return resume.failedPayment && !resume.successfulPayment;
          case 'no_payment':
            return !resume.paymentLogs || resume.paymentLogs.length === 0;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((resume) => {
      const agentName = resume.agentName.toLowerCase();
      return (
        resume.resumeNameComparable.includes(searchTerm) ||
        agentName.includes(searchTerm) ||
        resume.hostedId.toLowerCase().includes(searchTerm)
      );
    });
    }

    return filtered;
  }, [enrichedResumes, dateFilter, statusFilter, searchTerm, customStartDate, customEndDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResumes = enrichedResumes.filter((r) => {
      if (!r.createdAt) return false;
      const created = new Date(r.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    });

    // Payment statistics
    const paidResumes = enrichedResumes.filter((r) => r.successfulPayment || r.paymentStatus === 'paid');
    const pendingPayments = enrichedResumes.filter((r) => r.pendingPayment && !r.successfulPayment);
    const failedPayments = enrichedResumes.filter((r) => r.failedPayment && !r.successfulPayment);
    const cancelledPayments = enrichedResumes.filter((r) => r.cancelledPayment && !r.successfulPayment);
    const noPaymentAttempts = enrichedResumes.filter((r) => !r.paymentLogs || r.paymentLogs.length === 0);

    // Calculate revenue - only from real payment data
    const totalRevenue = paidResumes.reduce((sum, r) => {
      // Use amount from successful payment log if available, otherwise from hosted resume data
      const amount = r.successfulPayment?.amount || (r.paymentAmount && r.paymentAmount > 0 ? r.paymentAmount : 0);
      return sum + (amount || 0);
    }, 0);

    const todayPaid = todayResumes.filter((r) => r.successfulPayment || r.paymentStatus === 'paid');
    const todayRevenue = todayPaid.reduce((sum, r) => {
      // Use amount from successful payment log if available, otherwise from hosted resume data
      const amount = r.successfulPayment?.amount || (r.paymentAmount && r.paymentAmount > 0 ? r.paymentAmount : 0);
      return sum + (amount || 0);
    }, 0);

    return {
      total: enrichedResumes.length,
      today: todayResumes.length,
      active: enrichedResumes.filter((r) => r.downloadEnabled && !r.locked).length,
      locked: enrichedResumes.filter((r) => r.locked).length,
      disabled: enrichedResumes.filter((r) => !r.downloadEnabled).length,
      withEdit: enrichedResumes.filter((r) => r.editEnabled).length,
      // Payment stats
      paid: paidResumes.length || 0,
      pendingPayments: pendingPayments.length || 0,
      failedPayments: failedPayments.length || 0,
      cancelledPayments: cancelledPayments.length || 0,
      noPaymentAttempts: noPaymentAttempts.length || 0,
      totalRevenue: totalRevenue || 0,
      todayRevenue: todayRevenue || 0,
    };
  }, [enrichedResumes]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredResumes.length / PAGE_SIZE));
  }, [filteredResumes.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedResumes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredResumes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredResumes, currentPage]);

  const renderPagination = () => (
    <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * PAGE_SIZE + 1}-
        {Math.min(currentPage * PAGE_SIZE, filteredResumes.length)} of {filteredResumes.length}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 px-4">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hosted resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Resume Service Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and monitor hosted resumes for your clients</p>
            </div>
            <button
              onClick={fetchHostedResumes}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Statistics Cards - Two Rows */}
          <div className="space-y-4 mb-6">
            {/* First Row - Core Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">Today</p>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.today}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">Active</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-yellow-700 font-medium">Locked</p>
                  <Lock className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.locked}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-red-700 font-medium">Disabled</p>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{stats.disabled}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-purple-700 font-medium">Edit Enabled</p>
                  <Edit className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.withEdit}</p>
              </div>
            </div>

            {/* Second Row - Payment Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">Paid</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.paid}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-amber-700 font-medium">Pending</p>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">{stats.pendingPayments}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-red-700 font-medium">Failed</p>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{stats.failedPayments}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-emerald-700 font-medium">Total Revenue</p>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-emerald-900">₹{stats.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-teal-700 font-medium">Today Revenue</p>
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-teal-900">₹{stats.todayRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
  <label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-4 w-4 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search by resume name, agent, or ID..."
      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
    />
  </div>
</div>

              {/* Date Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="locked">Locked</option>
                  <option value="disabled">Disabled</option>
                  <optgroup label="Payment Status">
                    <option value="paid">Paid</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="failed_payment">Failed Payment</option>
                    <option value="no_payment">No Payment Attempt</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Quick Filter Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setDateFilter('today');
                  setStatusFilter('all');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  dateFilter === 'today' && statusFilter === 'all' && !searchTerm
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Today's Work
              </button>
              <button
                onClick={() => {
                  setStatusFilter('active');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✅ Active Only
              </button>
              <button
                onClick={() => {
                  setStatusFilter('locked');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'locked'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔒 Needs Attention
              </button>
              <button
                onClick={() => {
                  setStatusFilter('pending_payment');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'pending_payment'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💰 Pending Payment
              </button>
              <button
                onClick={() => {
                  setStatusFilter('no_payment');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'no_payment'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚠️ No Payment
              </button>
              <button
                onClick={() => {
                  setDateFilter('week');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  dateFilter === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 This Week
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredResumes.length}</span> resume{filteredResumes.length !== 1 ? 's' : ''}
            {dateFilter === 'today' && (
              <span className="ml-2 text-blue-600 font-medium">• Today's focus</span>
            )}
          </p>
          {filteredResumes.length > 0 && (
            <button
              onClick={() => {
                setDateFilter('today');
                setStatusFilter('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {hostedResumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hosted Resumes</h3>
            <p className="text-gray-500">No resumes have been exported for hosting yet.</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => {
                setDateFilter('today');
                setStatusFilter('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedResumes.map((resume) => {
                const isRecent = resume.createdAt && (() => {
                  const created = new Date(resume.createdAt);
                  const now = new Date();
                  const diffHours = (now - created) / (1000 * 60 * 60);
                  return diffHours < 2; // Created in last 2 hours
                })();

                return (
                  <div
                    key={resume.hostedId}
                    className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md overflow-hidden ${
                      isRecent ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`px-5 py-4 border-b ${
                      isRecent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {resume.resumeName || 'Untitled Resume'}
                            </h3>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono truncate">
                            ID: {resume.hostedId.slice(0, 12)}...
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(resume.createdAt)}
                          </p>
                        </div>
                        {resume.useDynamicData && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                            Live
                          </span>
                        )}
                      </div>
                      </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                      {/* Agent Info */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Agent:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{resume.agentName}</span>
                      </div>

                      {/* Payment Information - Always Show */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            Payment Status
                          </span>
                          {resume.successfulPayment ? (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              PAID
                            </span>
                          ) : resume.pendingPayment ? (
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                              PENDING
                            </span>
                          ) : resume.failedPayment ? (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                              FAILED
                            </span>
                          ) : resume.cancelledPayment ? (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                              CANCELLED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-500 text-white text-xs font-bold rounded-full">
                              NO ATTEMPT
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {resume.paymentAmount !== null && resume.paymentAmount !== undefined && resume.paymentAmount > 0 ? (
                        <div className="flex items-center justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-semibold text-gray-900">
                                ₹{resume.paymentAmount} {resume.paymentCurrency || ''}
                              </span>
                            </div>
                          ) : resume.successfulPayment?.amount ? (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-semibold text-gray-900">
                                ₹{resume.successfulPayment.amount} {resume.successfulPayment.currency || ''}
                              </span>
                            </div>
                          ) : resume.paymentLogs && resume.paymentLogs.length > 0 ? (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-medium text-gray-400">Not set</span>
                            </div>
                          ) : null}
                          {resume.successfulPayment ? (
                            <div className="flex items-center justify-between text-green-700">
                              <span>✅ Paid:</span>
                              <span className="font-medium">{formatTimeAgo(resume.successfulPayment.timestamp)}</span>
                            </div>
                          ) : resume.pendingPayment ? (
                            <div className="flex items-center justify-between text-amber-700">
                              <span>⏳ Last attempt:</span>
                              <span className="font-medium">{formatTimeAgo(resume.pendingPayment.timestamp)}</span>
                            </div>
                          ) : resume.failedPayment ? (
                            <div className="flex items-center justify-between text-red-700">
                              <span>❌ Failed:</span>
                              <span className="font-medium">{formatTimeAgo(resume.failedPayment.timestamp)}</span>
                            </div>
                          ) : resume.cancelledPayment ? (
                            <div className="flex items-center justify-between text-orange-700">
                              <span>🚫 Cancelled:</span>
                              <span className="font-medium">{formatTimeAgo(resume.cancelledPayment.timestamp)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-gray-500">
                              <span>No payment attempts yet</span>
                            </div>
                          )}
                          {resume.paymentLogs && resume.paymentLogs.length > 0 && (
                            <div className="flex items-center justify-between text-gray-600 pt-1.5 border-t border-blue-200">
                              <span>Total attempts:</span>
                              <span className="font-semibold">{resume.paymentLogs.length}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                          <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              resume.downloadEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                          <Download className="w-3 h-3 mr-1.5" />
                          {resume.downloadEnabled ? 'Download' : 'No Download'}
                          </span>
                          <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              resume.locked ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                          {resume.locked ? (
                            <Lock className="w-3 h-3 mr-1.5" />
                          ) : (
                            <Unlock className="w-3 h-3 mr-1.5" />
                          )}
                            {resume.locked ? 'Locked' : 'Unlocked'}
                          </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            resume.editEnabled
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Edit className="w-3 h-3 mr-1.5" />
                          {resume.editEnabled ? 'Edit' : 'No Edit'}
                          </span>
                      </div>

                      {/* URL Section */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-3">
                          <span className="text-xs text-gray-600 truncate flex-1 mr-2 font-mono">
                            {resume.hostedUrl}
                          </span>
                        <button
                          onClick={() => copyToClipboard(resume.hostedUrl)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                        </button>
                        </div>
                        <a
                          href={resume.hostedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Resume
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      </div>
                      </div>

                    {/* Card Footer - Actions */}
                    <div className="px-4 sm:px-5 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                        <button
                          onClick={() => toggleDownloadPermission(resume.hostedId, resume.downloadEnabled)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                            resume.downloadEnabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                        <Download className="w-4 h-4 mr-2" />
                        {resume.downloadEnabled ? 'Disable Download' : 'Enable Download'}
                        </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => toggleLockStatus(resume.hostedId, resume.locked)}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center ${
                            resume.locked
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {resume.locked ? (
                            <>
                              <Unlock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                              Lock
                            </>
                          )}
                                </button>
                                <button
                          onClick={() => toggleEditEnabled(resume.hostedId, resume.editEnabled)}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center ${
                            resume.editEnabled
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                          {resume.editEnabled ? 'Disable' : 'Enable'}
                                </button>
                              </div>
              </div>
                </div>
                );
              })}
            </div>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
