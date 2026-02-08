"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  CheckCircle, 
  User, 
  Activity, 
  ExternalLink,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [editingAgent, setEditingAgent] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState('');

  // Load agents from localStorage on component mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('salesAgents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    } else {
      // Initialize with default agent
      const initialAgents = [{
        id: 'agent_default_001',
        name: 'Admin',
        createdAt: new Date().toISOString(),
        isActive: true,
        totalLeads: 0,
        conversions: 0,
        revenue: 0
      }];
      setAgents(initialAgents);
      localStorage.setItem('salesAgents', JSON.stringify(initialAgents));
    }
  }, []);

  // Save agents to localStorage whenever agents array changes
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem('salesAgents', JSON.stringify(agents));
    }
  }, [agents]);

  // Generate unique agent ID
  const generateAgentId = (name) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    return `agent_${cleanName}_${timestamp}`;
  };

  // Add new agent
  const addAgent = () => {
    if (!newAgentName.trim()) return;

    const newAgent = {
      id: generateAgentId(newAgentName),
      name: newAgentName.trim(),
      createdAt: new Date().toISOString(),
      isActive: true,
      totalLeads: 0,
      conversions: 0,
      revenue: 0
    };

    setAgents(prev => [...prev, newAgent]);
    setNewAgentName('');
    setIsAddingAgent(false);
  };

  // Update agent
  const updateAgent = (agentId, updates) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  };

  // Delete agent
  const deleteAgent = (agentId) => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    }
  };

  // Generate agent dashboard URL
  const getAgentUrl = (agentId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/dashboard?agent=${agentId}`;
  };

  // Copy URL to clipboard
  const copyUrl = async (agentId) => {
    const url = getAgentUrl(agentId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(agentId);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sales Agents</h2>
            <p className="text-sm text-gray-600">Manage your sales team and generate unique dashboard URLs</p>
          </div>
          <button
            onClick={() => setIsAddingAgent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add Agent Form */}
        {isAddingAgent && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-gray-900 mb-3">Add New Agent</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Agent name (e.g., Sarah, James, Emily)"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addAgent()}
              />
              <button
                onClick={addAgent}
                disabled={!newAgentName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAddingAgent(false);
                  setNewAgentName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Agents List */}
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add your first sales agent to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      {editingAgent === agent.id ? (
                        <input
                          type="text"
                          value={agent.name}
                          onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                          className="font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                          onKeyPress={(e) => e.key === 'Enter' && setEditingAgent(null)}
                          onBlur={() => setEditingAgent(null)}
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {formatDate(agent.createdAt)}</span>
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Performance Stats */}
                    <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600 mr-4">
                      <span>{agent.totalLeads} leads</span>
                      <span>{agent.conversions} conversions</span>
                      <span>₹{agent.revenue}</span>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setEditingAgent(agent.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit agent name"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => copyUrl(agent.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                      title="Copy dashboard URL"
                    >
                      {copiedUrl === agent.id ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={getAgentUrl(agent.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                      title="Open agent dashboard"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      title="Delete agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Agent Dashboard URL */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Agent Dashboard URL:</p>
                      <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                        {getAgentUrl(agent.id)}
                      </code>
                    </div>
                    <button
                      onClick={() => copyUrl(agent.id)}
                      className={`ml-3 px-3 py-1 text-xs rounded transition-colors ${
                        copiedUrl === agent.id
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {copiedUrl === agent.id ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-2 text-xs text-gray-500">
                  💡 Share this URL with {agent.name} - it will automatically track their performance and assign leads to them.
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">How it works:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Each agent gets a unique dashboard URL with their ID</li>
            <li>• When they access their URL, all their activity is automatically tracked</li>
            <li>• Leads they claim and contacts they make are mapped to their profile</li>
            <li>• You can monitor all agents' performance in the founder dashboard</li>
            <li>• No passwords needed - just share the URL securely with each agent</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
