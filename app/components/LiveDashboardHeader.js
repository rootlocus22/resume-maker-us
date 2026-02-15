"use client";

import { useState } from 'react';
import { 
  Activity, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  BarChart3
} from 'lucide-react';

const LiveDashboardHeader = ({ 
  title = "Live Dashboard", 
  userType = "agent", // "agent" or "founder"
  userName = "User",
  onNotificationClick,
  onSettingsClick,
  onLogoutClick 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg">
                {userType === "founder" ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <BarChart3 className="w-6 h-6 text-white" />
                )}
              </div>
              
              {/* Brand Text */}
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ExpertResume
                  </h1>
                  <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-accent-400 to-accent text-white rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-sm text-gray-600 -mt-1">
                  {userType === "founder" ? "Founder Dashboard" : "Agent Dashboard"}
                </p>
              </div>
            </div>
          </div>

          {/* Center - Title (Desktop) */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Right Side - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">Live</span>
              </div>
            </div>

            {/* Notifications */}
            <button
              onClick={onNotificationClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600 capitalize">
                  {userType === "founder" ? "Founder" : "Sales Agent"}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {/* Mobile Brand Info */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ExpertResume
                  </h1>
                  <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-accent-400 to-accent text-white rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {userType === "founder" ? "Founder Dashboard" : "Agent Dashboard"}
                </p>
              </div>

              {/* Mobile Title */}
              <div className="px-3 py-2 border-t border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              </div>

              {/* Mobile Live Status */}
              <div className="px-3 py-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Live</span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="px-3 py-2 border-t border-gray-100 space-y-2">
                <button
                  onClick={onNotificationClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={onSettingsClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={onLogoutClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LiveDashboardHeader;
