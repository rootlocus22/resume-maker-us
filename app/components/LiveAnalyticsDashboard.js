"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Users, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw, 
  Eye, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';

const LiveAnalyticsDashboard = () => {
  const searchParams = useSearchParams();
  
  // State management
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Agent information state
  const [agentInfo, setAgentInfo] = useState({ name: "Agent", id: "agent_001" });
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('1h');
  const [entryPointFilter, setEntryPointFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Support action states
  const [supportNotes, setSupportNotes] = useState('');
  const [contactAttempt, setContactAttempt] = useState({ method: '', notes: '', outcome: '' });
  const [showAddContact, setShowAddContact] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        timeFilter,
        ...(entryPointFilter && { entryPoint: entryPointFilter }),
        ...(statusFilter && { supportStatus: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchQuery && { search: searchQuery }),
        limit: '100'
      });

      const response = await fetch(`/api/live-analytics-data?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setStats(result.stats);
      } else {
        console.error('Failed to fetch analytics data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load agent info from URL parameter and localStorage
  useEffect(() => {
    const agentIdFromUrl = searchParams.get('agent');
    
    if (agentIdFromUrl) {
      // Store in session storage for persistence
      sessionStorage.setItem('currentAgentId', agentIdFromUrl);
      
      // Get agent details from localStorage
      const savedAgents = localStorage.getItem('salesAgents');
      if (savedAgents) {
        const agents = JSON.parse(savedAgents);
        const currentAgent = agents.find(agent => agent.id === agentIdFromUrl);
        
        if (currentAgent) {
          setAgentInfo({ name: currentAgent.name, id: currentAgent.id });
        } else {
          // Agent not found, create default info from ID
          let agentName = 'Agent';
          
          if (agentIdFromUrl.includes('default') || agentIdFromUrl.includes('admin')) {
            agentName = 'Admin';
          } else {
            // Fallback: clean up the agent ID
            agentName = agentIdFromUrl.replace('agent_', '').replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
          
          setAgentInfo({ name: agentName, id: agentIdFromUrl });
        }
      }
    } else {
      // Check session storage for previously stored agent ID
      const storedAgentId = sessionStorage.getItem('currentAgentId');
      if (storedAgentId) {
        const savedAgents = localStorage.getItem('salesAgents');
        if (savedAgents) {
          const agents = JSON.parse(savedAgents);
          const currentAgent = agents.find(agent => agent.id === storedAgentId);
          
          if (currentAgent) {
            setAgentInfo({ name: currentAgent.name, id: currentAgent.id });
          }
        }
      }
    }
  }, [searchParams]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeFilter, entryPointFilter, statusFilter, priorityFilter, searchQuery]);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  // Update record status
  const updateRecordStatus = async (recordId, updates) => {
    try {
      const response = await fetch(`/api/live-analytics-data/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchData(); // Refresh data
        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord({ ...selectedRecord, ...updates });
        }
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  // Add contact attempt
  const addContactAttempt = async () => {
    if (!selectedRecord || !contactAttempt.method || !contactAttempt.notes) return;

    const newAttempt = {
      ...contactAttempt,
      timestamp: new Date().toISOString(),
      agent: agentInfo.name // Use actual agent name
    };

    const updatedContactAttempts = [...(selectedRecord.contactAttempts || []), newAttempt];

    await updateRecordStatus(selectedRecord.id, {
      contactAttempts: updatedContactAttempts,
      supportStatus: contactAttempt.outcome === 'successful' ? 'contacted' : 'new'
    });

    setContactAttempt({ method: '', notes: '', outcome: '' });
    setShowAddContact(false);
  };

  // Helper functions
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-primary-100 text-primary-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getDisplayName = (record) => {
    return record.profile?.name || 'Unknown User';
  };

  const getDisplayContact = (record) => {
    const email = record.profile?.email;
    const phone = record.profile?.phone;
    if (email && phone) return `${email} • ${phone}`;
    if (email) return email;
    if (phone) return phone;
    return 'No contact info';
  };

  // Time filter options
  const timeFilterOptions = [
    { value: '30m', label: 'Last 30 minutes' },
    { value: '1h', label: 'Last 1 hour' },
    { value: '2h', label: 'Last 2 hours' },
    { value: '3h', label: 'Last 3 hours' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '12h', label: 'Last 12 hours' },
    { value: '24h', label: 'Last 24 hours' },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-gray-600">Loading analytics data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Customer Analytics</h1>
            <p className="text-gray-600 mt-1">Real-time insights for customer support team</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ATS Checker</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.entryPointBreakdown?.['ats-score-checker'] || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upload Resume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.entryPointBreakdown?.['upload-resume'] || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Experience</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageExperience || 0}y
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {timeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Entry Point Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Point</label>
              <select
                value={entryPointFilter}
                onChange={(e) => setEntryPointFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Entry Points</option>
                <option value="ats-score-checker">ATS Score Checker</option>
                <option value="upload-resume">Upload Resume</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getDisplayName(record)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.profile?.jobTitle || 'No title'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDisplayContact(record)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.profile?.address || 'No location'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {record.profile?.yearsOfExperience || 0}y
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {record.entryPoint}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDeviceIcon(record.deviceType)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {record.deviceType || 'unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.supportStatus)}`}>
                        {record.supportStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(record.supportPriority)}`}>
                        {record.supportPriority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users match the current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                User Details: {getDisplayName(selectedRecord)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedRecord.profile?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Job Title:</span>
                      <span className="font-medium">{selectedRecord.profile?.jobTitle || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedRecord.profile?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedRecord.profile?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedRecord.profile?.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{selectedRecord.profile?.yearsOfExperience || 0} years</span>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                {selectedRecord.profile?.summary && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedRecord.profile.summary.length > 300 
                        ? `${selectedRecord.profile.summary.substring(0, 300)}...` 
                        : selectedRecord.profile.summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {selectedRecord.skills && selectedRecord.skills.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.skills.slice(0, 10).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                          {skill.name}
                        </span>
                      ))}
                      {selectedRecord.skills.length > 10 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{selectedRecord.skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Information & Actions */}
              <div className="space-y-4">
                {/* Device & Browser Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Device & Browser</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device:</span>
                      <span className="font-medium capitalize">{selectedRecord.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Browser:</span>
                      <span className="font-medium">
                        {selectedRecord.browserInfo?.name} {selectedRecord.browserInfo?.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entry Point:</span>
                      <span className="font-medium">{selectedRecord.entryPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Page URL:</span>
                      <span className="font-medium text-xs">{selectedRecord.pageUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Support Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Support Actions</h4>
                  
                  {/* Status Update */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedRecord.supportStatus}
                      onChange={(e) => updateRecordStatus(selectedRecord.id, { supportStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Priority Update */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={selectedRecord.supportPriority}
                      onChange={(e) => updateRecordStatus(selectedRecord.id, { supportPriority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Add Contact Attempt */}
                  <div className="mb-4">
                    {!showAddContact ? (
                      <button
                        onClick={() => setShowAddContact(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Contact Attempt
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <select
                          value={contactAttempt.method}
                          onChange={(e) => setContactAttempt({ ...contactAttempt, method: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        >
                          <option value="">Select method...</option>
                          <option value="phone">Phone Call</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                        </select>
                        
                        <textarea
                          placeholder="Contact notes..."
                          value={contactAttempt.notes}
                          onChange={(e) => setContactAttempt({ ...contactAttempt, notes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                          rows={2}
                        />
                        
                        <select
                          value={contactAttempt.outcome}
                          onChange={(e) => setContactAttempt({ ...contactAttempt, outcome: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        >
                          <option value="">Select outcome...</option>
                          <option value="successful">Successful</option>
                          <option value="no_answer">No Answer</option>
                          <option value="busy">Busy</option>
                          <option value="not_interested">Not Interested</option>
                          <option value="follow_up">Follow-up Required</option>
                        </select>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={addContactAttempt}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddContact(false);
                              setContactAttempt({ method: '', notes: '', outcome: '' });
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact History */}
                {selectedRecord.contactAttempts && selectedRecord.contactAttempts.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedRecord.contactAttempts.map((attempt, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium capitalize">{attempt.method}</span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(attempt.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-1">{attempt.notes}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            attempt.outcome === 'successful' ? 'bg-green-100 text-green-800' :
                            attempt.outcome === 'not_interested' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attempt.outcome.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Experience & Education Summary */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Experience */}
              {selectedRecord.experience && selectedRecord.experience.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Experience</h4>
                  <div className="space-y-3">
                    {selectedRecord.experience.slice(0, 3).map((exp, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm">{exp.jobTitle}</div>
                        <div className="text-gray-600 text-sm">{exp.company}</div>
                        <div className="text-gray-500 text-xs">{exp.startDate} - {exp.endDate}</div>
                      </div>
                    ))}
                    {selectedRecord.experience.length > 3 && (
                      <div className="text-sm text-gray-500 text-center">
                        +{selectedRecord.experience.length - 3} more positions
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedRecord.education && selectedRecord.education.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                  <div className="space-y-3">
                    {selectedRecord.education.slice(0, 2).map((edu, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm">{edu.degree}</div>
                        <div className="text-gray-600 text-sm">{edu.institution}</div>
                        <div className="text-gray-500 text-xs">{edu.field}</div>
                        {edu.gpa && <div className="text-gray-500 text-xs">GPA: {edu.gpa}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAnalyticsDashboard;
