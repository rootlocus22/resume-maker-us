"use client";
import { useState, useRef, useEffect } from "react";
import {
  X, Save, RotateCcw, Palette, Info, Move, Eye, EyeOff, Layout,
  Maximize2, Minimize2, Settings, Sparkles, Grid3X3, Columns,
  MousePointer, Zap, CheckCircle2, AlertCircle, Monitor, Smartphone,
  ArrowLeft, ArrowRight, RotateCw, Download, Share2, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ResumePreview from "./ResumePreview";

export default function SectionReorderEditor({
  isOpen,
  onClose,
  onSave,
  data,
  template,
  customColors,
  preferences,
  language,
  country,
  isPremium,
  onResetLayout,
  templates,
  isCompactMode,
  onToggleCompactMode
}) {
  const [isDragEnabled, setIsDragEnabled] = useState(true); // Always enabled in editor
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [tempSectionOrder, setTempSectionOrder] = useState(null);
  const [tempSidebarSections, setTempSidebarSections] = useState(null);
  const [tempMainSections, setTempMainSections] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [localCompactMode, setLocalCompactMode] = useState(isCompactMode || false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
  const [showGrid, setShowGrid] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  // Premium check - prevent non-premium users from accessing the editor
  // Premium check removed to prevent premature closing during loading. 
  // Access control is handled by the parent component.

  // Initialize temp state when editor opens or template changes
  useEffect(() => {
    if (isOpen && isPremium) {
      // Clear previous temp state first to ensure template isolation
      setTempSectionOrder(null);
      setTempSidebarSections(null);
      setTempMainSections(null);

      // Load template-specific custom order if it exists
      const existingOrder = preferences?.layout?.customSectionOrder;

      if (existingOrder) {
        if (existingOrder.layout === 'single-column') {
          setTempSectionOrder(existingOrder.sectionsOrder || null);
        } else if (existingOrder.layout === 'two-column') {
          setTempSidebarSections(existingOrder.sidebarSections || null);
          setTempMainSections(existingOrder.mainSections || null);
        }
      }
      setHasChanges(false);
    }
  }, [isOpen, preferences, template, isPremium]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Escape to cancel
      if (e.key === 'Escape') {
        handleCancel();
        return;
      }

      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges) {
          handleSave();
        }
        return;
      }

      // Ctrl+R to reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleReset();
        return;
      }

      // F to toggle fullscreen
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        handleToggleFullscreen();
        return;
      }

      // G to toggle grid
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        handleToggleGrid();
        return;
      }

      // H to toggle instructions
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        handleToggleInstructions();
        return;
      }

      // 1, 2, 3 for device preview
      if (['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
        const devices = ['desktop', 'tablet', 'mobile'];
        handleDeviceChange(devices[parseInt(e.key) - 1]);
        return;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, hasChanges]);



  // Handle compact mode toggle
  const handleToggleCompactMode = () => {
    const newCompactMode = !localCompactMode;
    setLocalCompactMode(newCompactMode);
    if (onToggleCompactMode) {
      onToggleCompactMode();
    }
    // Force re-render of ResumePreview with new compact mode
    setHasChanges(true);
  };

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    setIsAnimating(true);
    setIsFullscreen(!isFullscreen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle device preview toggle
  const handleDeviceChange = (device) => {
    setPreviewDevice(device);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Handle grid toggle
  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Handle instructions toggle
  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Handle drag and drop
  const handleSectionOrderChange = (orderConfig) => {
    if (orderConfig.layout === 'single-column') {
      setTempSectionOrder(orderConfig.sectionsOrder);
    } else if (orderConfig.layout === 'two-column') {
      setTempSidebarSections(orderConfig.sidebarSections);
      setTempMainSections(orderConfig.mainSections);
    }
    setHasChanges(true);
  };

  // Save changes and close
  const handleSave = () => {
    let orderConfig;

    if (tempSectionOrder) {
      // Already in single column mode
      orderConfig = { sectionsOrder: tempSectionOrder, layout: 'single-column' };
    } else {
      // Check if sidebar is empty, if so save as single column
      const sidebarSections = tempSidebarSections || [];
      const mainSections = tempMainSections || [];

      if (sidebarSections.length === 0 && mainSections.length > 0) {
        // Auto-save as single column when sidebar is empty
        orderConfig = {
          sectionsOrder: mainSections,
          layout: 'single-column'
        };
      } else {
        // Save as two-column layout
        orderConfig = {
          sidebarSections: sidebarSections,
          mainSections: mainSections,
          layout: 'two-column'
        };
      }
    }

    onSave(orderConfig);
    onClose();
  };

  // Reset to template defaults
  const handleReset = () => {
    setTempSectionOrder(null);
    setTempSidebarSections(null);
    setTempMainSections(null);
    setHasChanges(false);

    // Also reset to template defaults by calling parent function
    if (onResetLayout) {
      onResetLayout();
    }
  };

  // Cancel and close
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Create modified preferences for preview with dynamic layout switching
  const previewPreferences = (() => {
    let customSectionOrder;

    if (tempSectionOrder) {
      // Already in single column mode
      customSectionOrder = { sectionsOrder: tempSectionOrder, layout: 'single-column' };
    } else if (tempSidebarSections || tempMainSections) {
      // Check if sidebar is empty, if so switch to single column
      const sidebarSections = tempSidebarSections || [];
      const mainSections = tempMainSections || [];

      if (sidebarSections.length === 0 && mainSections.length > 0) {
        // Auto-switch to single column when sidebar is empty
        customSectionOrder = {
          sectionsOrder: mainSections,
          layout: 'single-column'
        };
      } else {
        // Keep two-column layout
        customSectionOrder = {
          sidebarSections: sidebarSections,
          mainSections: mainSections,
          layout: 'two-column'
        };
      }
    } else {
      // Use existing custom order or template default
      customSectionOrder = preferences?.layout?.customSectionOrder;
    }

    return {
      ...preferences,
      layout: {
        ...preferences?.layout,
        customSectionOrder
      }
    };
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex flex-col ${isFullscreen ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-900 via-gray-900 to-primary-900'}`}
        >
          {/* Glassmorphism Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white/10 backdrop-blur-xl border-b border-white/20 text-white px-8 py-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              {/* Left Section - Branding & Status */}
              <div className="flex items-center gap-6">
                <motion.div
                  className="flex items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="text-white" size={28} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                        Resume Editor Pro
                      </h1>
                      <motion.span
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        PREMIUM
                      </motion.span>
                    </div>
                    <p className="text-accent-200 text-sm font-medium">
                      Professional drag-and-drop section editor
                    </p>
                  </div>
                </motion.div>

                {/* Live Status Indicators */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-2 bg-accent-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-400/30"
                    animate={{ boxShadow: ['0 0 0 0 rgba(0, 196, 179, 0.4)', '0 0 0 8px rgba(0, 196, 179, 0)', '0 0 0 0 rgba(0, 196, 179, 0.4)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                    <span className="text-accent-200 text-sm font-medium">Live Editor</span>
                  </motion.div>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 ${hasChanges
                      ? 'bg-amber-500/20 border-amber-400/30 text-amber-200'
                      : 'bg-accent-500/20 border-accent-400/30 text-accent-200'
                    }`}>
                    {hasChanges ? (
                      <AlertCircle size={14} className="animate-pulse" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span className="text-sm font-medium">
                      {hasChanges ? 'Unsaved Changes' : 'All Saved'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center - Device Preview Toggles */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: Smartphone, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map((device) => (
                  <motion.button
                    key={device.id}
                    onClick={() => handleDeviceChange(device.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${previewDevice === device.id
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <device.icon size={16} />
                    {device.label}
                  </motion.button>
                ))}
              </div>

              {/* Right Section - Advanced Controls */}
              <div className="flex items-center gap-2">
                {/* View Controls */}
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                  <motion.button
                    onClick={handleToggleGrid}
                    className={`p-2 rounded-full transition-all duration-200 ${showGrid ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Toggle Grid"
                  >
                    <Grid3X3 size={16} />
                  </motion.button>

                  <motion.button
                    onClick={handleToggleFullscreen}
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </motion.button>

                  <motion.button
                    onClick={handleToggleInstructions}
                    className={`p-2 rounded-full transition-all duration-200 ${showInstructions ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Toggle Instructions"
                  >
                    <HelpCircle size={16} />
                  </motion.button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <motion.button
                    onClick={onResetLayout}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full font-medium transition-all duration-200 border border-white/20"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    title="Reset to Template Default"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </motion.button>

                  <motion.button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-200 ${hasChanges
                        ? 'bg-gradient-to-r from-accent to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg hover:shadow-xl border border-accent-400/50'
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-500/30'
                      }`}
                    whileHover={hasChanges ? { scale: 1.02, y: -1 } : {}}
                    whileTap={hasChanges ? { scale: 0.98 } : {}}
                  >
                    <Save size={16} />
                    Save Changes
                  </motion.button>

                  <motion.button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-red-200 hover:text-white rounded-full font-medium transition-all duration-200 border border-red-400/30"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={16} />
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>



          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Instructions Sidebar */}
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 overflow-y-auto"
                >
                  <div className="space-y-6">
                    {/* Quick Start Guide */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                          <MousePointer size={16} className="text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Quick Start</h3>
                      </div>

                      <div className="space-y-3">
                        {[
                          { icon: '1️⃣', text: 'Click and hold any section to start dragging' },
                          { icon: '2️⃣', text: 'Drop sections in new positions to reorder' },
                          { icon: '3️⃣', text: 'Use drop zones to move between columns' },
                          { icon: '4️⃣', text: 'Save changes when you\'re happy' }
                        ].map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <span className="text-lg">{step.icon}</span>
                            <p className="text-white/80 text-sm leading-relaxed">{step.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} className="text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Pro Tips</h3>
                      </div>

                      <div className="space-y-3">
                        {[
                          'Use compact view for easier dragging',
                          'Empty sidebar auto-converts to single column',
                          'Grid overlay helps with alignment',
                          'Changes are saved per template'
                        ].map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-400/20"
                          >
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <p className="text-yellow-200 text-sm">{tip}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Layout Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-accent to-accent-700 rounded-lg flex items-center justify-center">
                          <Layout size={16} className="text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">Current Layout</h3>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/70 text-sm">Mode:</span>
                          <span                           className={`px-2 py-1 rounded-full text-xs font-medium ${previewPreferences?.layout?.customSectionOrder?.layout === 'single-column'
                              ? 'bg-accent-500/20 text-accent-300 border border-accent-400/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            }`}>
                            {previewPreferences?.layout?.customSectionOrder?.layout === 'single-column'
                              ? 'Single Column'
                              : 'Two Column'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Template:</span>
                          <span className="text-white font-medium text-sm capitalize">{template}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Area */}
            <div className="flex-1 relative">
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div
                    className="w-full h-full opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                </div>
              )}

              {/* Preview Container */}
              <motion.div
                className="h-full flex flex-col items-center p-6 overflow-y-auto"
                animate={{
                  scale: isAnimating ? 0.95 : 1,
                  opacity: isAnimating ? 0.8 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  ref={containerRef}
                  className="bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden flex flex-col"
                  style={{
                    width: (() => {
                      switch (previewDevice) {
                        case 'mobile': return isFullscreen ? '400px' : '350px';
                        case 'tablet': return isFullscreen ? '600px' : '500px';
                        default: return isFullscreen ? '900px' : '750px';
                      }
                    })(),
                    maxHeight: 'calc(100vh - 180px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  whileHover={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    y: -2
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {/* Device Frame Header */}
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-500 text-xs ml-2 font-medium">
                          {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} Preview
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={handleToggleCompactMode}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${localCompactMode
                              ? 'bg-accent text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {localCompactMode ? 'Full View' : 'Compact'}
                        </motion.button>
                      </div>
                    </div>

                    {/* Resume Preview */}
                    <div className="bg-white flex-1 overflow-y-auto">
                      <div
                        className="p-6"
                        style={{
                          width: '100%',
                          transform: (() => {
                            if (previewDevice === 'mobile') return 'scale(0.6)';
                            if (previewDevice === 'tablet') return 'scale(0.75)';
                            return localCompactMode ? 'scale(0.8)' : 'scale(0.9)';
                          })(),
                          transformOrigin: 'top center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <ResumePreview
                          data={data}
                          template={template}
                          customColors={customColors}
                          preferences={previewPreferences}
                          language={language}
                          country={country}
                          isPremium={isPremium}
                          manualScale={1}
                          onSectionOrderChange={handleSectionOrderChange}
                          isReorderEditor={true}
                          isCompactMode={localCompactMode}
                          enableDragAndDrop={true}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border-t border-white/10 text-white px-8 py-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              {/* Left Section - Status & Info */}
              <div className="flex items-center gap-4">
                {/* Template Badge */}
                <motion.div
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <Palette size={16} className="text-accent-400" />
                  <span className="text-white/90 text-sm font-medium">
                    {template.charAt(0).toUpperCase() + template.slice(1).replace('_', ' ')}
                  </span>
                </motion.div>

                {/* Layout Badge */}
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${previewPreferences?.layout?.customSectionOrder?.layout === 'single-column'
                      ? 'bg-accent-500/20 border-accent-400/30 text-accent-300'
                      : 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                    }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <Columns size={16} />
                  <span className="text-sm font-medium">
                    {previewPreferences?.layout?.customSectionOrder?.layout === 'single-column'
                      ? 'Single Column'
                      : 'Two Column'}
                  </span>
                </motion.div>

                {/* Device Indicator */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  {previewDevice === 'desktop' && <Monitor size={16} className="text-gray-300" />}
                  {previewDevice === 'tablet' && <Smartphone size={16} className="text-gray-300" />}
                  {previewDevice === 'mobile' && <Smartphone size={16} className="text-gray-300" />}
                  <span className="text-white/70 text-sm">
                    {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} View
                  </span>
                </div>
              </div>

              {/* Center - Quick Actions */}
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <motion.div
                    className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30"
                    animate={{
                      boxShadow: ['0 0 0 0 rgba(245, 158, 11, 0.4)', '0 0 0 8px rgba(245, 158, 11, 0)', '0 0 0 0 rgba(245, 158, 11, 0.4)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle size={16} className="text-amber-300 animate-pulse" />
                    <span className="text-amber-200 text-sm font-medium">
                      {tempSectionOrder || tempSidebarSections || tempMainSections ? 'Pending Changes' : 'No Changes'}
                    </span>
                  </motion.div>
                )}

                {/* Performance Indicator */}
                <div className="flex items-center gap-2 bg-accent-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-accent-400/30">
                  <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                  <span className="text-accent-200 text-xs font-medium">Real-time</span>
                </div>
              </div>

              {/* Right Section - Keyboard Shortcuts */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/70 border border-white/20">F</kbd>
                    <span>Fullscreen</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/70 border border-white/20">G</kbd>
                    <span>Grid</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/70 border border-white/20">H</kbd>
                    <span>Help</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/70 border border-white/20">Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white/70 border border-white/20">S</kbd>
                    <span>Save</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 