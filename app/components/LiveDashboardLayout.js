"use client";

import { Toaster } from "react-hot-toast";
import LiveDashboardHeader from "./LiveDashboardHeader";

const LiveDashboardLayout = ({ 
  children, 
  title,
  userType = "agent",
  userName = "User"
}) => {
  const handleNotificationClick = () => {
    // Handle notifications
    console.log("Notifications clicked");
  };

  const handleSettingsClick = () => {
    // Handle settings
    console.log("Settings clicked");
  };

  const handleLogoutClick = () => {
    // Handle logout
    console.log("Logout clicked");
    // You can add actual logout logic here
    // For now, redirect to home
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header for Live Dashboards */}
      <LiveDashboardHeader
        title={title}
        userType={userType}
        userName={userName}
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogoutClick}
      />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default LiveDashboardLayout;
