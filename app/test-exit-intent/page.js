"use client";

import { useState, useEffect } from 'react';
import { ExitIntentDetector } from '../lib/exitIntent';

export default function TestExitIntent() {
  const [status, setStatus] = useState('Initializing...');
  const [triggerHistory, setTriggerHistory] = useState([]);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    const exitDetector = new ExitIntentDetector({
      delay: 1000,
      maxDisplays: 3, // Allow multiple triggers for testing
      threshold: 25,
      sensitivity: 15
    });

    exitDetector.onExitIntent((trigger, timeOnPage) => {
      const newTrigger = {
        trigger,
        timeOnPage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTriggerHistory(prev => [...prev, newTrigger]);
      setStatus(`🚨 Exit Intent Triggered: ${trigger}`);
      
      console.log('Exit intent triggered:', newTrigger);
    });

    setDetector(exitDetector);
    setStatus('✅ Exit Intent Detector Active');

    return () => {
      exitDetector.destroy();
    };
  }, []);

  const manualTrigger = () => {
    if (detector) {
      detector.manualTrigger();
      setStatus('🔧 Manual trigger activated');
    }
  };

  const clearHistory = () => {
    setTriggerHistory([]);
    setStatus('🧹 History cleared');
  };

  const resetSession = () => {
    sessionStorage.removeItem('exitIntentShown');
    setStatus('🔄 Session reset - detector re-enabled');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white">
          <h1 className="text-4xl font-black mb-6 text-center">
            🧪 Exit Intent Testing Lab
          </h1>
          
          {/* Status Panel */}
          <div className="bg-black/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">🔍 Current Status</h2>
            <p className="text-lg font-mono bg-white/20 rounded-lg p-3">
              {status}
            </p>
          </div>

          {/* Manual Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={manualTrigger}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              🔧 Manual Trigger
            </button>
            
            <button
              onClick={clearHistory}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              🧹 Clear History
            </button>
            
            <button
              onClick={resetSession}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              🔄 Reset Session
            </button>
          </div>

          {/* Trigger Methods */}
          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🎯 Available Trigger Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold">🖱️ Mouse Events:</p>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Move mouse to top of page (exit intent)</li>
                  <li>Rapid upward mouse movement</li>
                  <li>Mouse leave from top of window</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">⌨️ Keyboard Shortcuts:</p>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Ctrl+W (close tab)</li>
                  <li>Ctrl+T (new tab)</li>
                  <li>Ctrl+L (address bar)</li>
                  <li>Alt+F4 (close window)</li>
                  <li>Escape key</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">📱 Mobile Events:</p>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Fast upward swipe near top</li>
                  <li>Orientation change</li>
                  <li>Touch and drag upward quickly</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">🌐 Browser Events:</p>
                <ul className="list-disc list-inside space-y-1 text-white/80">
                  <li>Tab hidden/visibility change</li>
                  <li>Window blur (focus lost)</li>
                  <li>Back button attempt</li>
                  <li>Navigation click attempt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Test Links */}
          <div className="bg-yellow-500/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🔗 Navigation Blocking Test</h2>
            <p className="mb-4 text-white/90">
              Click these links to test navigation blocking (exit intent should trigger):
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </a>
              <a href="/pricing" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                💰 Pricing
              </a>
              <a href="/templates" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                📄 Templates
              </a>
              <button onClick={() => window.location.href = '/login'} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                🔑 Login
              </button>
            </div>
          </div>

          {/* Trigger History */}
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📊 Trigger History</h2>
            {triggerHistory.length === 0 ? (
              <p className="text-white/70 italic">No triggers yet. Try the methods above!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {triggerHistory.map((item, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-yellow-300">{item.trigger}</span>
                      <span className="text-white/70 ml-2">({item.timeOnPage}ms on page)</span>
                    </div>
                    <span className="text-xs text-white/50">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">📝 Testing Instructions</h2>
            <div className="space-y-2 text-sm text-white/90">
              <p>• <strong>Desktop:</strong> Try keyboard shortcuts or move mouse to top of page</p>
              <p>• <strong>Mobile:</strong> Try fast upward swipes near the top of the screen</p>
              <p>• <strong>Navigation:</strong> Click any of the test links above</p>
              <p>• <strong>Tab Switching:</strong> Switch to another tab or app</p>
              <p>• <strong>Manual:</strong> Use the manual trigger button for testing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 