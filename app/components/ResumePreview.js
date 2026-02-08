"use client";
import { useState, useRef, useMemo, useEffect, memo } from "react";
import { format, parse, isValid } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import { templates } from "../lib/templates.js";
import { defaultConfig } from "../lib/templates.js";
import { atsFriendlyTemplates } from "../lib/atsFriendlyTemplates.js";
import { onePagerTemplates } from "../lib/onePagerTemplates.js";
import { rankResume } from "../lib/utils";
import toast from "react-hot-toast";
import { formatDate, parseResumeDate } from "../lib/utils";
import { renderSkillName, renderSkillWithProficiency } from "../lib/skillUtils";
import ATSResumeRenderer from "./ATSResumeRenderer";
import VisualAppealRenderer from "./VisualAppealRenderer";
import { parseRichText } from "../lib/richTextRenderer";

// Feature flag to enable/disable drag and drop functionality
const ENABLE_DRAG_AND_DROP = true; // Set to true to enable drag and drop

// Map language codes to date-fns locales
const localeMap = {
  en: enUS,
  es: es,
  fr: fr,
};

// Expanded list of common date formats
const COMMON_FORMATS = [
  "MM-yyyy", "MMM yyyy", "MMMM yyyy", "MM/yyyy", "yyyy-MM", "yyyy/MM", "yyyy", "yyyy/MM/dd", "yyyy-MM-dd", "dd/MM/yyyy", "dd-MM-yyyy", "MMM dd, yyyy", "dd MMM yyyy", "MMMM dd, yyyy"
];

// Enhanced tryParseDate function
const tryParseDate = (date, formatStrs, locale = enUS) => {
  if (!date) return null;
  if (date instanceof Date && isValid(date)) return date;
  if (typeof date === "string" && date.trim().toLowerCase() === "present") return "Present";
  for (const fmt of formatStrs) {
    try {
      const parsed = parse(date, fmt, new Date(), { locale });
      if (isValid(parsed)) return parsed;
    } catch { }
  }
  try {
    const fallback = new Date(date);
    if (isValid(fallback)) return fallback;
  } catch { }
  if (typeof date === "string") {
    if (/^\d{4}$/.test(date)) return new Date(parseInt(date), 0, 1);
    if (/^\d{4}-\d{2}$/.test(date) || /^\d{4}\/\d{2}$/.test(date)) {
      const [year, month] = date.includes("-") ? date.split("-") : date.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
  }
  return date;
};

// Add a helper to render description as bullets if needed
function renderDescriptionBullets(description, forceATS = false, excludeTexts = []) {
  if (!description) return null;

  // Handle both string and array descriptions
  let lines;
  if (Array.isArray(description)) {
    // If it's already an array, use it directly after trimming
    lines = description.map(l => String(l).trim()).filter(Boolean);
  } else {
    // If it's a string, split into lines, trim, and filter empty
    lines = String(description).split('\n').map(l => l.trim()).filter(Boolean);
  }

  // For ATS templates or when forced, always render as bullets if multiple lines
  let bulletLines = lines.filter(l => /^[-•*]/.test(l));

  // Filter out redundant first lines that match title/company etc.
  if (excludeTexts.length > 0) {
    const normalizedExclude = excludeTexts.map(t => String(t || "").toLowerCase().trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLineClean = lines[0].replace(/^[-•*]\s*/, "").toLowerCase().trim();
      if (normalizedExclude.some(exclude => firstLineClean === exclude || firstLineClean.includes(`as ${exclude}`))) {
        lines.shift();
        // Re-evaluate bulletLines after shifting
        bulletLines = lines.filter(l => /^[-•*]/.test(l));
      }
    }
  }

  const shouldRenderAsBullets = forceATS ? lines.length > 1 : bulletLines.length >= Math.max(2, lines.length / 2);

  if (shouldRenderAsBullets) {
    return (
      <ul className="list-disc ml-5 space-y-1">
        {lines.map((line, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: parseRichText(line.replace(/^[-•*]\s*/, "")) }} />
        ))}
      </ul>
    );
  }
  // Otherwise, render as paragraphs inside a div
  return <div>{lines.map((line, idx) => <p key={idx} dangerouslySetInnerHTML={{ __html: parseRichText(line) }} />)}</div>;
}

const ResumePreview = memo(function ResumePreview({
  data,
  template = "visual_modern_executive",
  customColors = {},
  preferences = defaultConfig,
  language = "en",
  country = "us",
  isPremium,
  manualScale = null,
  initialScale = 1,
  onSectionOrderChange, // New prop for handling section order changes
  isReorderEditor = false, // New prop to indicate if this is used in full-screen editor
}) {
  const templateKey = `${country.toLowerCase()}_${template}`;

  // Check for Visual Appeal templates at top level to adjust container styles
  const isVisualAppealTemplate = (template && template.startsWith('visual_')) ||
    (templateKey && templateKey.includes('visual_')) ||
    (template && typeof template === 'object' && template.category === 'Visual Appeal');
  const { score, tips } = rankResume(data);

  // Normalize experience data to ensure jobTitle is always present
  const normalizeExperienceData = (experienceData) => {
    if (!experienceData || !Array.isArray(experienceData)) return [];

    return experienceData.map(exp => ({
      ...exp,
      jobTitle: exp.jobTitle || exp.title || exp.position || "Job Title"
    }));
  };

  // Normalize the data
  const normalizedData = {
    ...data,
    experience: normalizeExperienceData(data.experience)
  };

  // Debug logging removed to prevent hydration issues

  // Drag and drop state - controlled by feature flag
  const [isDragEnabled, setIsDragEnabled] = useState(ENABLE_DRAG_AND_DROP);

  // Compact mode state - disabled by default
  const [isCompactMode, setIsCompactMode] = useState(false);

  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [customSectionOrder, setCustomSectionOrder] = useState(null);
  const [customSidebarSections, setCustomSidebarSections] = useState(null);
  const [customMainSections, setCustomMainSections] = useState(null);
  const [hasDraggedBefore, setHasDraggedBefore] = useState(false);

  // Mobile touch drag and drop state
  const [touchStart, setTouchStart] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Tutorial and guidance state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [hasDraggedOnce, setHasDraggedOnce] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Detect mobile device and add global touch listeners
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Add global touch move listener for mobile drag
    const handleGlobalTouchMove = (e) => {
      if (isMobile && isDragging) {
        e.preventDefault(); // Prevent body scroll during drag
        handleTouchMove(e);
      }
    };

    const handleGlobalTouchEnd = (e) => {
      if (isMobile && isDragging) {
        handleTouchEnd(e);
      }
    };

    // Prevent body scroll when dragging
    const preventBodyScroll = (e) => {
      if (isMobile && isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchmove', preventBodyScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchmove', preventBodyScroll);
    };
  }, [isMobile, isDragging, isDragEnabled, draggedSection, draggedElement, touchStart, touchStartTime, dragOverTarget]);

  // Add/remove body scroll prevention class
  useEffect(() => {
    if (isMobile && isDragging) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobile, isDragging]);

  // Ensure drag is enabled ONLY when in editor mode
  useEffect(() => {
    if (isReorderEditor) {
      setIsDragEnabled(true);
    } else {
      // Disable drag and drop everywhere except in the dedicated editor
      setIsDragEnabled(false);
    }
  }, [isReorderEditor]);

  // Check if user has seen tutorial and show it for first-time users
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('resumePreviewTutorialSeen');
    // Only show tutorial when user manually enables drag mode, not automatically
    if (!tutorialSeen && isDragEnabled && !isReorderEditor) {
      // Show tutorial after a short delay to let the component load
      const timer = setTimeout(() => {
        setShowTutorial(true);
        setShowDragHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDragEnabled, isReorderEditor]);

  // Auto-hide drag hint after some time
  useEffect(() => {
    if (showDragHint) {
      const timer = setTimeout(() => {
        setShowDragHint(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showDragHint]);

  // Clear local state when template changes to ensure template isolation
  useEffect(() => {
    setCustomSectionOrder(null);
    setCustomSidebarSections(null);
    setCustomMainSections(null);
    setDraggedSection(null);
    setDragOverTarget(null);
  }, [template]);

  // Handle drag start
  const handleDragStart = (e, section) => {
    if (!isDragEnabled) return;

    // Don't prevent default for dragstart - this prevents dragging from working
    // e.preventDefault();
    e.stopPropagation();

    setDraggedSection(section);
    setDragOverTarget(null);

    // Only enable compact mode if user is actually dragging (not just touching)
    if (e.type === 'dragstart') {
      setIsCompactMode(true);
    }

    // Add drag feedback
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', section);
    }

    // Add visual feedback
    console.log(`Drag started for section: ${section}`);
  };

  const handleDragOver = (e, section) => {
    if (!isDragEnabled || !draggedSection || draggedSection === section) return;

    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(section);

    // Add visual feedback
    console.log(`Drag over section: ${section}`);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverTarget(null);
    }
  };

  // Helper function to get section at position
  const getSectionAtPosition = (x, y) => {
    const elements = document.querySelectorAll('.resume-section');
    let closestElement = null;
    let minDistance = Infinity;

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(y - elementCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestElement = element;
      }
    });

    if (closestElement) {
      return closestElement.getAttribute('data-section');
    }
    return null;
  };

  // Handle drop operation
  const handleDrop = (draggedSection, targetSection) => {
    if (!draggedSection || !targetSection || draggedSection === targetSection) return;

    console.log(`Drop operation: ${draggedSection} -> ${targetSection}`);

    // Get current sections configuration
    const currentSectionOrder = customSectionOrder || (layout?.sectionsOrder || ["personal", "summary", "experience", "education", "skills"]);
    const currentSidebarSections = customSidebarSections || layout?.sidebarSections || [];
    const currentMainSections = customMainSections || layout?.mainSections || [];

    if (layout?.columns === 2) {
      // Two-column layout - handle sidebar/main zone changes
      let newSidebarSections = [...currentSidebarSections];
      let newMainSections = [...currentMainSections];

      // Remove dragged section from current position
      newSidebarSections = newSidebarSections.filter(s => s !== draggedSection);
      newMainSections = newMainSections.filter(s => s !== draggedSection);

      // Determine target zone based on target section's current location
      let targetZone = 'main';
      if (currentSidebarSections.includes(targetSection)) {
        targetZone = 'sidebar';
      }

      // Add to target zone at correct position
      if (targetZone === 'sidebar') {
        const targetIndex = newSidebarSections.indexOf(targetSection);
        if (targetIndex >= 0) {
          newSidebarSections.splice(targetIndex, 0, draggedSection);
        } else {
          newSidebarSections.push(draggedSection);
        }
      } else {
        const targetIndex = newMainSections.indexOf(targetSection);
        if (targetIndex >= 0) {
          newMainSections.splice(targetIndex, 0, draggedSection);
        } else {
          newMainSections.push(draggedSection);
        }
      }

      // Update two-column layout
      setCustomSidebarSections(newSidebarSections);
      setCustomMainSections(newMainSections);

      // Notify parent of the change
      if (onSectionOrderChange) {
        onSectionOrderChange({
          sidebarSections: newSidebarSections,
          mainSections: newMainSections,
          layout: 'two-column'
        });
      }
    } else {
      // Single-column layout - simple reordering
      const newSectionOrder = [...currentSectionOrder];
      const draggedIndex = newSectionOrder.indexOf(draggedSection);
      const targetIndex = newSectionOrder.indexOf(targetSection);

      if (draggedIndex >= 0 && targetIndex >= 0) {
        // Remove dragged section from its current position
        newSectionOrder.splice(draggedIndex, 1);

        // Insert at target position
        newSectionOrder.splice(targetIndex, 0, draggedSection);

        // Update single-column layout
        setCustomSectionOrder(newSectionOrder);

        // Notify parent of the change
        if (onSectionOrderChange) {
          onSectionOrderChange({
            sectionsOrder: newSectionOrder,
            layout: 'single-column'
          });
        }
      }
    }

    // Show success message for first-time users
    if (!hasDraggedBefore) {
      setHasDraggedBefore(true);
      localStorage.setItem('hasDraggedBefore', 'true');
      toast.success('Great! You can drag sections to reorder your resume.', {
        duration: 3000,
        icon: '🎉'
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    if (!isDragEnabled) return;

    e.preventDefault();
    e.stopPropagation();

    console.log(`Drag ended. Dragged: ${draggedSection}, Target: ${dragOverTarget}`);

    if (draggedSection && dragOverTarget) {
      handleDrop(draggedSection, dragOverTarget);
    }

    setDraggedSection(null);
    setDragOverTarget(null);
    // Don't reset compact mode - let user control it manually
  };

  // Handle touch start for mobile drag
  const handleTouchStart = (e, section) => {
    if (!isDragEnabled || !isMobile) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, section });
    setTouchStartTime(Date.now());
    setDraggedElement(e.currentTarget);

    // Don't automatically enable compact mode on touch start
    // Only enable it if user actually starts dragging
  };

  // Handle touch move for mobile drag
  const handleTouchMove = (e) => {
    if (!isDragEnabled || !isMobile || !touchStart) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStartTime;

    // Only start dragging if there's significant movement and it's intentional
    if (deltaTime > 200 && (deltaX > 10 || deltaY > 10)) {
      if (!isDragging) {
        setIsDragging(true);
        setDraggedSection(touchStart.section);
        setDragOverTarget(null);
        setDragOffset({ x: deltaX, y: deltaY });

        // Only enable compact mode when actual dragging starts
        setIsCompactMode(true);
      }

      // Continue with drag logic
      const targetSection = getSectionAtPosition(touch.clientX, touch.clientY);
      if (targetSection && targetSection !== draggedSection) {
        setDragOverTarget(targetSection);
      }

      // Update drag offset
      setDragOffset({ x: deltaX, y: deltaY });
    }
  };

  // Handle touch end for mobile drag
  const handleTouchEnd = (e) => {
    if (!isDragEnabled || !isMobile) return;

    e.preventDefault();
    e.stopPropagation();

    if (isDragging && draggedSection && dragOverTarget) {
      handleDrop(draggedSection, dragOverTarget);
    }

    // Reset all touch states but keep compact mode if user was actually dragging
    setTouchStart(null);
    setTouchStartTime(0);
    setIsDragging(false);
    setDraggedSection(null);
    setDragOverTarget(null);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });

    // Don't automatically reset compact mode - let user control it manually
    // Only reset if user wasn't actually dragging (just touched)
    if (!isDragging) {
      setIsCompactMode(false);
    }
  };

  // Toggle drag mode (only used in editor)
  const toggleDragMode = () => {
    setIsDragEnabled(!isDragEnabled);
    // Don't automatically reset compact mode - let user control it
  };

  // Toggle compact mode for better drag experience
  const toggleCompactMode = () => {
    setIsCompactMode(!isCompactMode);
  };

  // Tutorial functions
  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      endTutorial();
    }
  };

  const endTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    setShowDragHint(false);
    setHighlightedSection(null);
    localStorage.setItem('resumePreviewTutorialSeen', 'true');
    setHasSeenTutorial(true);
  };

  const skipTutorial = () => {
    endTutorial();
  };

  const showTutorialAgain = () => {
    localStorage.removeItem('resumePreviewTutorialSeen');
    startTutorial();
  };

  const templateConfig = useMemo(
    () => {
      // Safety check: ensure templates object exists
      if (!templates || typeof templates !== 'object') {
        console.warn('Templates object is undefined, using fallback');
        return {
          name: "Default",
          layout: {
            sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
            showIcons: false,
            columns: 1,
            headerStyle: "compact"
          },
          styles: {
            fontFamily: "Arial, sans-serif",
            colors: {
              primary: "#2c3e50",
              secondary: "#7f8c8d",
              accent: "#3498db",
              text: "#34495e",
              background: "#ffffff"
            }
          }
        };
      }

      // Template lookup and configuration

      // Check if this is an ATS template first
      let config = null;
      if (template && template.startsWith('ats_')) {
        // Debug logging disabled to prevent console flooding
        // console.log('ATS Template Detection:', {
        //   template,
        //   templateKey,
        //   availableTemplates: Object.keys(templates),
        //   availableATSTemplates: Object.keys(atsFriendlyTemplates)
        // });

        // For ATS templates, check both templates and atsFriendlyTemplates
        config = templates[template] || atsFriendlyTemplates[template];

        // If still not found, try country-specific
        if (!config) {
          config = templates[templateKey] || atsFriendlyTemplates[templateKey];
        }

        // If still not found, try to find any ATS template
        if (!config) {
          const availableATS = Object.keys(atsFriendlyTemplates).filter(key => key.startsWith('ats_'));
          if (availableATS.length > 0) {
            config = atsFriendlyTemplates[availableATS[0]];
          }
        }

        // Debug logging disabled to prevent console flooding
        // console.log('ATS Template Config Found:', {
        //   configName: config?.name,
        //   configLayout: config?.layout,
        //   skillsLayout: config?.layout?.skillsLayout
        // });
      }

      // If not an ATS template or ATS template not found, use regular template lookup
      if (!config) {
        config = templates[template] ||           // Direct template name match
          templates[templateKey] ||         // Country-specific template
          onePagerTemplates[template] ||    // One-Pager template match
          onePagerTemplates[templateKey] || // Country-specific One-Pager
          templates.classic ||
          templates.modern_professional ||
          Object.values(templates)[0];      // Last resort: use first template
      }

      if (!config) {
        console.warn(`Template not found: ${template} or ${templateKey}, using default`);
        // Create a minimal fallback config if nothing exists
        config = {
          name: "Default",
          layout: {
            sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
            showIcons: false,
            columns: 1
          },
          styles: {
            fontFamily: "Arial, sans-serif",
            colors: {
              primary: "#2c3e50",
              secondary: "#7f8c8d",
              accent: "#3498db",
              text: "#34495e",
              background: "#ffffff"
            }
          }
        };
      }



      // Check if THIS SPECIFIC template has been customized
      const thisTemplateCustomOrder = preferences?.layout?.customSectionOrder;
      const hasLocalCustomization = isReorderEditor && (customSectionOrder || customSidebarSections !== null || customMainSections !== null);

      // Only apply custom ordering if this template has been explicitly modified
      if (hasLocalCustomization || thisTemplateCustomOrder) {

        // Priority: local state > saved template preferences > template default
        let finalSectionsOrder = config.layout.sectionsOrder;
        let finalSidebarSections = config.layout.sidebarSections;
        let finalMainSections = config.layout.mainSections;
        let finalColumns = config.layout.columns;

        // Apply saved preferences ONLY if they exist for this template
        if (thisTemplateCustomOrder) {
          if (thisTemplateCustomOrder.layout === 'single-column') {
            finalSectionsOrder = thisTemplateCustomOrder.sectionsOrder;
            finalColumns = 1;
            finalSidebarSections = [];
            finalMainSections = thisTemplateCustomOrder.sectionsOrder;
          } else if (thisTemplateCustomOrder.layout === 'two-column') {
            finalSidebarSections = thisTemplateCustomOrder.sidebarSections || [];
            finalMainSections = thisTemplateCustomOrder.mainSections || [];
            finalColumns = 2;
          }
        }

        // Override with current session changes if any (only for current template and only in editor mode)
        if (isReorderEditor && customSectionOrder) {
          finalSectionsOrder = customSectionOrder;
          finalColumns = 1;
        }
        if (isReorderEditor && customSidebarSections !== null) {
          finalSidebarSections = customSidebarSections;
          finalColumns = 2;
        }
        if (isReorderEditor && customMainSections !== null) {
          finalMainSections = customMainSections;
          finalColumns = 2;
        }

        config = {
          ...config,
          layout: {
            ...config.layout,
            sectionsOrder: finalSectionsOrder,
            sidebarSections: finalSidebarSections,
            mainSections: finalMainSections,
            columns: finalColumns
          }
        };

      }

      return config;
    },
    [templateKey, template, preferences]
  );
  const defaultConfig = {
    layout: {
      sectionsOrder: ["personal", "summary", "experience", "education", "skills"],
      showIcons: false,
      columns: 1,
      headerStyle: "compact"
    },
    styles: {
      fontFamily: "Arial, sans-serif",
      colors: {
        primary: "#2c3e50",
        secondary: "#7f8c8d",
        accent: "#3498db",
        text: "#34495e",
        background: "#ffffff"
      }
    }
  };

  const { layout, styles } = templateConfig || defaultConfig;

  // Ensure layout always exists and has required properties
  const safeLayout = {
    sectionsOrder: layout?.sectionsOrder || defaultConfig.layout.sectionsOrder,
    columns: layout?.columns || defaultConfig.layout.columns,
    sidebarSections: layout?.sidebarSections || [],
    mainSections: layout?.mainSections || [],
    headerStyle: layout?.headerStyle || defaultConfig.layout.headerStyle,
    showIcons: layout?.showIcons || defaultConfig.layout.showIcons,
    spacing: layout?.spacing || 'standard',
    showProfilePicture: layout?.showProfilePicture || false,
    ...layout
  };

  // Ensure styles always exists and has required properties
  const safeStyles = {
    fontFamily: styles?.fontFamily || defaultConfig.styles.fontFamily,
    fontSize: styles?.fontSize || "12pt",
    lineHeight: styles?.lineHeight || "1.4",
    colors: styles?.colors || defaultConfig.styles.colors,
    ...styles
  };

  // apply typography override - but respect ATS template fonts
  const isATSTemplate = (template && template.startsWith('ats_')) || (templateKey && templateKey.includes('ats_'));
  if (!isATSTemplate) {
    // Only override font family for non-ATS templates
    const effectiveFontFamily = preferences?.typography?.fontPair?.fontFamily || safeStyles.fontFamily;
    safeStyles.fontFamily = effectiveFontFamily;
  }
  // For ATS templates, keep the original template font family for maximum compatibility

  const mergedColors = useMemo(() => {
    const defaultColors = safeStyles.colors || {};
    const custom = customColors[template] || customColors || {};
    return {
      ...defaultColors,
      ...custom,
      primary: custom.primary || defaultColors.primary || "#4B5EAA",
      secondary: custom.secondary || defaultColors.secondary || "#6B7280",
      text: custom.text || defaultColors.text || "#1F2937",
      accent: custom.accent || defaultColors.accent || "#9333EA",
      background: custom.background || defaultColors.background || "#FFFFFF",
    };
  }, [safeStyles.colors, customColors, template]);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(initialScale);

  useEffect(() => {
    if (manualScale !== null) {
      setScale(manualScale);
      return;
    }
    const updateScale = () => {
      const baseWidth = 700;
      const viewportWidth = window.innerWidth;
      const padding = viewportWidth < 640 ? 16 : 32;
      const availableWidth = viewportWidth - padding;
      const newScale = Math.min(1, availableWidth / baseWidth);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [manualScale]);

  // React to preferences changes
  useEffect(() => {
    // Preferences updated - component will re-render with new config
  }, [preferences]);

  // Updated formatDate function
  const formatDate = (date, preferences, language = "en", country = "us") => {
    if (!date) return "";
    if (typeof date === "string" && date.trim().toLowerCase() === "present") return "Present";
    const locale = localeMap[language] || enUS;
    let userFormat = preferences?.dateFormat?.format || "MMM yyyy";
    const monthDisplay = preferences?.dateFormat?.monthDisplay;
    if (monthDisplay) {
      if (monthDisplay === "short") userFormat = "MMM yyyy";
      else if (monthDisplay === "long") userFormat = "MMMM yyyy";
      else if (monthDisplay === "numeric") {
        userFormat = country === "us" ? "MM/yyyy" : "dd/MM/yyyy";
      }
    }
    let dateObj = tryParseDate(date, [userFormat, ...COMMON_FORMATS], locale);
    if (dateObj === "Present") return "Present";
    if (!dateObj || !isValid(dateObj)) {
      if (typeof date === "string") {
        if (/^\d{4}$/.test(date)) return date;
        if (/^\d{4}-\d{2}$/.test(date)) {
          const [year, month] = date.split("-");
          return country === "us" ? `${month}-${year}` : `${month}/${year}`;
        }
        if (/^\d{4}\/\d{2}$/.test(date)) {
          const [year, month] = date.split("/");
          return `${month}/${year}`;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [year, month, day] = date.split("-");
          return country === "us" ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
        }
        if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
          const [year, month, day] = date.split("/");
          return `${day}/${month}/${year}`;
        }
        if (/^[A-Za-z]{3}\s\d{4}$/.test(date)) {
          try {
            const parsed = parse(date, "MMM yyyy", new Date(), { locale });
            if (isValid(parsed)) return format(parsed, userFormat, { locale });
          } catch { }
        }
      }
      return date;
    }
    try {
      return format(dateObj, userFormat, { locale });
    } catch (error) {
      return date;
    }
  };

  const iconMap = {
    Bookmark: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Briefcase: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <rect x="3" y="7" width="18" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12v.01" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 13a20 20 0 0 0 18 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    GraduationCap: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22v-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17l-3-3 3-3 3 3-3 3z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Award: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <circle cx="12" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Wrench: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Languages: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M2 12h20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2v20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6v12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Project: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12h.01" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12h.01" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Volunteer: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Publication: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Reference: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Hobby: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mergedColors.accent} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12h.01" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  const sectionIconMap = {
    summary: "Bookmark",
    experience: "Briefcase",
    education: "GraduationCap",
    skills: "Wrench",
    certifications: "Award",
    languages: "Languages",
    project: "Project",
    volunteer: "Volunteer",
    publication: "Publication",
    reference: "Reference",
    award: "Award",
    hobby: "Hobby",
  };

  const translations = {
    en: {
      summary: "Profile",
      experience: "Employment History",
      education: "Education",
      skills: "Skills",
      certifications: "Certifications",
      languages: "Languages",
      project: "Projects",
      volunteer: "Volunteer Work",
      publication: "Publications",
      reference: "References",
      award: "Awards",
      hobby: "Interests",
    },
    es: {
      summary: "Perfil",
      experience: "Historial de Empleo",
      education: "Educación",
      skills: "Habilidades",
      certifications: "Certificaciones",
      languages: "Idiomas",
      project: "Proyectos",
      volunteer: "Trabajo Voluntario",
      publication: "Publicaciones",
      reference: "Referencias",
      award: "Premios",
      hobby: "Intereses",
    },
    fr: {
      summary: "Profil",
      experience: "Historique d'Emploi",
      education: "Éducation",
      skills: "Compétences",
      certifications: "Certifications",
      languages: "Langues",
      project: "Projets",
      volunteer: "Travail Bénévole",
      publication: "Publications",
      reference: "Références",
      award: "Prix",
      hobby: "Centres d'Intérêt",
    },
  };

  const t = translations[language] || translations.en;

  // Updated cleanText function to handle different field types
  const cleanText = (text, fieldType = "text") => {
    if (!text) return "";
    // For numeric fields like GPA, return the text as-is (trimmed)
    if (fieldType === "numeric") {
      return text.toString().trim();
    }
    // For text fields, preserve line breaks but normalize other whitespace
    if (fieldType === "text" || fieldType === "summary" || fieldType === "description") {
      return text.toString().trim();
    }
    // For other fields, normalize whitespace and trim, preserve hyphens
    return text.replace(/\s+/g, " ").trim();
  };

  const renderHeader = () => {
    const headerBaseStyle = {
      background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`,
      fontFamily: safeStyles.fontFamily || "Arial, sans-serif",
    };

    // Spacing system for one-pager templates
    const getSpacing = () => {
      if (safeLayout.spacing === "onepager-ultra-compact") {
        return {
          headerMargin: "mb-3", // Ultra-compact: reduced from mb-4
          sectionMargin: "mb-2", // Ultra-compact: reduced from mb-3
          titleMargin: "mb-0.5", // Ultra-compact: reduced from mb-1
          textMargin: "mb-1", // Ultra-compact: reduced from mb-2
          padding: "p-2", // Ultra-compact: reduced from p-3
          sectionGap: "space-y-2" // Ultra-compact section spacing
        };
      } else if (safeLayout.spacing === "onepager-compact") {
        return {
          headerMargin: "mb-4", // Reduced from mb-6
          sectionMargin: "mb-3", // Reduced from mb-6
          titleMargin: "mb-1", // Reduced from mb-2
          textMargin: "mb-2", // Reduced from mb-3
          padding: "p-3", // Reduced from p-4
          sectionGap: "space-y-3" // Compact section spacing
        };
      }
      return {
        headerMargin: "mb-6",
        sectionMargin: "mb-6",
        titleMargin: "mb-2",
        textMargin: "mb-3",
        padding: "p-4",
        sectionGap: "space-y-4"
      };
    };

    const spacing = getSpacing();

    // ONE-PAGER HEADERS - Check these FIRST before other conditions
    if (safeLayout.headerStyle === "onepager-clean") {
      return (
        <header className={`${spacing.headerMargin} border-b border-gray-300 pb-3`}>
          <div className="text-center">
            <h1
              className={`text-xl font-bold ${spacing.titleMargin}`}
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className={`text-sm ${spacing.textMargin}`}
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
              {data.dateOfBirth && (
                <>
                  <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                </>
              )}
              {data.gender && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.gender}</span>
                </>
              )}
              {data.maritalStatus && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                </>
              )}
              {data.linkedin && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                </>
              )}
              {data.portfolio && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (safeLayout.headerStyle === "onepager-modern") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} rounded-lg text-white`} style={{ backgroundColor: mergedColors.primary }}>
          <div className="text-center">
            <h1
              className={`text-xl font-semibold ${spacing.titleMargin}`}
              style={{
                color: "#ffffff",
                fontFamily: safeStyles.fontFamily,
                fontWeight: "600"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className={`text-sm ${spacing.textMargin}`}
              style={{
                color: "#ffffff",
                fontFamily: safeStyles.fontFamily,
                opacity: "0.9"
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs" style={{ opacity: "0.85" }}>
              <span style={{ color: "#ffffff" }}>{data.email || "email@example.com"}</span>
              <span style={{ color: "#ffffff" }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.address}</span>
                </>
              )}
              {data.linkedin && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.linkedin}</span>
                </>
              )}
              {data.portfolio && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.portfolio}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    if (safeLayout.headerStyle === "onepager-two-column") {
      return (
        <header className={`${spacing.headerMargin} pb-3`}>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="text-left">
              <h1
                className={`text-xl font-bold ${spacing.titleMargin}`}
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ color: mergedColors.text }}>
              <div>{data.email || "email@example.com"}</div>
              <div>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div>{data.address}</div>}
              {data.linkedin && <div>{data.linkedin}</div>}
              {data.portfolio && <div>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    if (safeLayout.headerStyle === "onepager-tech") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} rounded-lg text-white`} style={{
          background: `linear-gradient(90deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`
        }}>
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-xl font-semibold ${spacing.titleMargin}`}
                style={{
                  color: "#ffffff",
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "600"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: "#ffffff",
                  fontFamily: safeStyles.fontFamily,
                  opacity: "0.9"
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ opacity: "0.85" }}>
              <div style={{ color: "#ffffff" }}>{data.email || "email@example.com"}</div>
              <div style={{ color: "#ffffff" }}>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div style={{ color: "#ffffff" }}>{data.address}</div>}
              {data.linkedin && <div style={{ color: "#ffffff" }}>{data.linkedin}</div>}
              {data.portfolio && <div style={{ color: "#ffffff" }}>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    if (safeLayout.headerStyle === "onepager-sales") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} bg-gray-50 rounded-lg`} style={{ borderLeft: `4px solid ${mergedColors.accent}` }}>
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-xl font-bold ${spacing.titleMargin}`}
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ color: mergedColors.text }}>
              <div>{data.email || "email@example.com"}</div>
              <div>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div>{data.address}</div>}
              {data.linkedin && <div>{data.linkedin}</div>}
              {data.portfolio && <div>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    if (safeLayout.headerStyle === "onepager-finance") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} border-2 rounded-lg`} style={{
          borderColor: mergedColors.primary,
          borderStyle: "solid"
        }}>
          <div className="text-center">
            <h1
              className={`text-xl font-bold ${spacing.titleMargin}`}
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className={`text-sm ${spacing.textMargin}`}
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs" style={{ color: mergedColors.text }}>
              <span>{data.email || "email@example.com"}</span>
              <span>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span>{data.address}</span>
                </>
              )}
              {data.linkedin && (
                <>
                  <span>{data.linkedin}</span>
                </>
              )}
              {data.portfolio && (
                <>
                  <span>{data.portfolio}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // USER'S ORIGINAL COMPACT HEADER STYLE
    if (safeLayout.headerStyle === "compact") {
      return (
        <header
          className="p-3 rounded-lg shadow-md text-center text-white"
          style={headerBaseStyle}
        >
          <h1
            className="text-xl font-bold"
            style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
          >
            {data.name || "Your Name"}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
          >
            {data.jobTitle || ""}
          </p>
          <div
            className="text-xs mt-1 space-y-0.5"
            style={{
              color: "#ffffff",
              fontFamily: safeStyles.fontFamily,
              whiteSpace: "normal"
            }}
          >
            <p>{data.email || "email@example.com"}</p>
            <p>{data.phone || "+1 (555) 123-4567"}</p>
            {data.address && <p>{data.address}</p>}
            {data.linkedin && (
              <p style={{ opacity: 0.95 }}>{data.linkedin}</p>
            )}
            {data.portfolio && (
              <p style={{ opacity: 0.95 }}>{data.portfolio}</p>
            )}
          </div>
        </header>
      );
    }

    // USER'S ORIGINAL FULL-WIDTH HEADER STYLE
    if (safeLayout.headerStyle === "full-width") {
      return (
        <header
          className="p-4 rounded-t-lg shadow-md text-white"
          style={headerBaseStyle}
        >
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              {data.photo && (
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
                >
                  {data.name || "Your Name"}
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
                >
                  {data.jobTitle || ""}
                </p>
              </div>
            </div>
            <div
              className="text-xs space-y-1 text-right"
              style={{
                color: "#ffffff",
                fontFamily: safeStyles.fontFamily,
                whiteSpace: "normal"
              }}
            >
              <p>{data.email || "email@example.com"}</p>
              <p>{data.phone || "+1 (555) 123-4567"}</p>
              {data.address && <p>{data.address}</p>}
              {data.linkedin && (
                <p style={{ opacity: 0.95 }}>{data.linkedin}</p>
              )}
              {data.portfolio && (
                <p style={{ opacity: 0.95 }}>{data.portfolio}</p>
              )}
            </div>
          </div>
        </header>
      );
    }

    // MINIMAL HEADER - Clean typography focus
    if (safeLayout.headerStyle === "minimal" || safeLayout.headerStyle === "minimal-header") {
      return (
        <header className="border-b-2 border-gray-100 pb-4">
          <div className="text-center">
            <h1
              className="text-4xl font-light tracking-wide mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "300",
                letterSpacing: "0.1em"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg font-normal mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily,
                letterSpacing: "0.05em"
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex flex-col items-center space-y-1 text-sm">
              {/* Primary contact info */}
              <div className="flex justify-center items-center space-x-6">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                )}
              </div>
              {/* Personal details and web presence */}
              {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                <div className="flex justify-center items-center space-x-6">
                  {data.dateOfBirth && (
                    <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                  )}
                  {data.gender && (
                    <span style={{ color: mergedColors.text }}>{data.gender}</span>
                  )}
                  {data.maritalStatus && (
                    <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                  )}
                  {data.linkedin && (
                    <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                  )}
                  {data.portfolio && (
                    <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // CREATIVE ASYMMETRIC HEADER - Simplified with no cuts
    if (safeLayout.headerStyle === "creative-asymmetric") {
      return (
        <header className="relative rounded-2xl overflow-hidden" style={{
          minHeight: "120px",
          background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.secondary} 60%, ${mergedColors.accent} 100%)`
        }}>
          {/* Subtle background decorations - no cuts */}
          <div className="absolute inset-0">
            {/* Soft accent shape - fully contained */}
            <div
              className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${mergedColors.accent} 0%, transparent 70%)`
              }}
            ></div>

            {/* Simple decorative dots - safely positioned */}
            <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-white opacity-20"></div>
            <div className="absolute top-10 left-4 w-1 h-1 rounded-full bg-white opacity-30"></div>
            <div className="absolute bottom-6 right-10 w-1.5 h-1.5 rounded-full bg-white opacity-15"></div>
          </div>

          {/* Content container - simple horizontal layout */}
          <div className="relative z-10 px-6 py-6 text-white">
            <div className="flex items-center justify-between gap-6">
              {/* Left section - Name and title */}
              <div className="flex-shrink-0">
                <h1
                  className="text-3xl font-bold leading-tight mb-1"
                  style={{
                    fontFamily: safeStyles.fontFamily,
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    color: "white"
                  }}
                >
                  {data.name || "Your Name"}
                </h1>

                <p
                  className="text-lg font-medium opacity-90"
                  style={{
                    fontFamily: safeStyles.fontFamily,
                    textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    color: "white"
                  }}
                >
                  {data.jobTitle || ""}
                </p>
              </div>

              {/* Center section - Contact info */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-4 text-sm opacity-90 flex-wrap justify-center">
                  {/* Email */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                    <span>{data.email || "email@example.com"}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                    <span>{data.phone || "+1 (555) 123-4567"}</span>
                  </div>

                  {/* Address */}
                  {data.address && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                      <span>{data.address}</span>
                    </div>
                  )}

                  {/* Personal details and social links */}
                  {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                    <div className="flex items-center space-x-2">
                      {data.dateOfBirth && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                          <span>DOB: {data.dateOfBirth}</span>
                        </div>
                      )}
                      {data.gender && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                          <span>{data.gender}</span>
                        </div>
                      )}
                      {data.maritalStatus && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                          <span>{data.maritalStatus}</span>
                        </div>
                      )}
                      {data.linkedin && (
                        <a
                          href={data.linkedin}
                          className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
                        >
                          <span className="text-xs font-bold">in</span>
                        </a>
                      )}
                      {data.portfolio && (
                        <a
                          href={data.portfolio}
                          className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
                        >
                          <span className="text-xs">🔗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right section - Photo (kept as requested) */}
              <div className="relative flex-shrink-0">
                {data.photo ? (
                  <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    {/* Creative frame */}
                    <div
                      className="absolute -inset-2 rounded-xl opacity-30"
                      style={{
                        background: `linear-gradient(45deg, ${mergedColors.accent} 0%, rgba(255,255,255,0.3) 100%)`,
                        transform: "rotate(-4deg)"
                      }}
                    ></div>

                    <img
                      src={data.photo}
                      alt="Profile"
                      className="relative w-20 h-20 rounded-xl object-cover shadow-2xl border-2 border-white"
                      style={{
                        filter: "contrast(1.05) saturate(1.05)"
                      }}
                    />

                    {/* Decorative corner accent */}
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: mergedColors.accent }}
                    ></div>
                  </div>
                ) : (
                  <div className="relative transform rotate-1">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-2xl border-2 border-white"
                      style={{
                        background: `linear-gradient(135deg, ${mergedColors.accent} 0%, ${mergedColors.secondary} 100%)`
                      }}
                    >
                      {(data.name || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      );
    }

    // CREATIVE HEADER - Bold and artistic
    if (safeLayout.headerStyle === "creative") {
      return (
        <header
          className="mb-6 p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`,
            color: "#ffffff"
          }}
        >
          {/* Creative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="creative-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#creative-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            {data.photo && (
              <div className="flex-shrink-0">
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  fontFamily: safeStyles.fontFamily,
                  background: "linear-gradient(45deg, #fff, #f0f0f0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p className="text-xl font-medium mb-3 opacity-90">
                {data.jobTitle || ""}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm opacity-85">
                <div>{data.email || "email@example.com"}</div>
                <div>{data.phone || "+1 (555) 123-4567"}</div>
                {data.address && <div className="col-span-2">{data.address}</div>}
                {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                  <div className="col-span-2 flex flex-wrap gap-4 mt-2">
                    {data.dateOfBirth && <div>DOB: {data.dateOfBirth}</div>}
                    {data.gender && <div>{data.gender}</div>}
                    {data.maritalStatus && <div>{data.maritalStatus}</div>}
                    {data.linkedin && <div>{data.linkedin}</div>}
                    {data.portfolio && <div>{data.portfolio}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      );
    }

    // ELEGANT HEADER - Space-efficient, balanced design
    if (safeLayout.headerStyle === "elegant") {
      return (
        <header className="mb-6 text-center">
          {/* Name and job title in compact layout */}
          <div className="mb-4">
            <h1
              className="text-3xl font-light mb-1 tracking-wide"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "300",
                letterSpacing: "0.03em"
              }}
            >
              {data.name || "Your Name"}
            </h1>

            {/* Compact separator */}
            <div className="flex items-center justify-center mb-2">
              <div
                className="h-0.5 w-12"
                style={{ background: mergedColors.accent }}
              ></div>
              <div
                className="w-1 h-1 rounded-full mx-2"
                style={{ background: mergedColors.accent }}
              ></div>
              <div
                className="h-0.5 w-12"
                style={{ background: mergedColors.accent }}
              ></div>
            </div>

            <p
              className="text-lg font-normal tracking-wider"
              style={{
                color: mergedColors.secondary,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "400",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              {data.jobTitle || ""}
            </p>
          </div>

          {/* Contact information in clean horizontal layout */}
          <div className="text-sm">
            {/* Primary contact row - email and phone */}
            <div className="flex justify-center items-center space-x-6 mb-2">
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.email || "email@example.com"}
              </span>
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.phone || "+1 (555) 123-4567"}
              </span>
            </div>

            {/* Secondary contact row - address and web presence */}
            <div className="flex justify-center items-center space-x-6">
              {data.address && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.address}
                </span>
              )}
              {data.linkedin && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.linkedin}
                </span>
              )}
              {data.portfolio && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.portfolio}
                </span>
              )}
            </div>

            {/* Personal details row - DOB, gender, marital status */}
            {(data.dateOfBirth || data.gender || data.maritalStatus) && (
              <div className="flex justify-center items-center space-x-6 mt-2">
                {data.dateOfBirth && (
                  <span
                    className="font-medium text-xs"
                    style={{ color: mergedColors.text }}
                  >
                    DOB: {data.dateOfBirth}
                  </span>
                )}
                {data.gender && (
                  <span
                    className="font-medium text-xs"
                    style={{ color: mergedColors.text }}
                  >
                    {data.gender}
                  </span>
                )}
                {data.maritalStatus && (
                  <span
                    className="font-medium text-xs"
                    style={{ color: mergedColors.text }}
                  >
                    {data.maritalStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>
      );
    }

    // HERO BANNER - Large impactful header
    if (safeLayout.headerStyle === "hero-banner") {
      return (
        <header
          className="mb-6 p-6 rounded-xl relative"
          style={{
            background: mergedColors.headerGradient || `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`,
            color: "#ffffff",
            minHeight: "120px"
          }}
        >
          <div className="absolute inset-0 bg-black opacity-10 rounded-xl"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center">
              {data.photo && (
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg mx-auto mb-3"
                />
              )}
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  fontFamily: safeStyles.fontFamily,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p className="text-lg font-light mb-4 opacity-95">
                {data.jobTitle || ""}
              </p>
              <div className="flex flex-col items-center space-y-1 text-sm">
                {/* Primary contact info */}
                <div className="flex justify-center items-center space-x-6">
                  <span>{data.email || "email@example.com"}</span>
                  <span>{data.phone || "+1 (555) 123-4567"}</span>
                  {data.address && (
                    <>
                      <span>{data.address}</span>
                    </>
                  )}
                </div>
                {/* Personal details and web presence */}
                {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                  <div className="flex justify-center items-center space-x-6">
                    {data.dateOfBirth && (
                      <>
                        <span>DOB: {data.dateOfBirth}</span>
                      </>
                    )}
                    {data.gender && (
                      <>
                        <span>{data.gender}</span>
                      </>
                    )}
                    {data.maritalStatus && (
                      <>
                        <span>{data.maritalStatus}</span>
                      </>
                    )}
                    {data.linkedin && (
                      <>
                        <span>{data.linkedin}</span>
                      </>
                    )}
                    {data.portfolio && (
                      <>
                        <span>{data.portfolio}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      );
    }

    // PORTFOLIO MODERN HEADER - Professional portfolio style (resume-appropriate sizing)
    if (safeLayout.headerStyle === "portfolio-modern") {
      return (
        <header className="mb-6 relative" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", borderRadius: "12px", overflow: "hidden" }}>
          {/* Decorative top accent */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 50%, ${mergedColors.secondary} 100%)`
            }}
          ></div>

          <div className="p-5">
            <div className="flex items-start gap-5">
              {/* Photo section with modern styling - smaller for resume */}
              <div className="flex-shrink-0">
                {data.photo ? (
                  <div className="relative group">
                    <img
                      src={data.photo}
                      alt="Profile"
                      className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-white group-hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent to-blue-500 opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white"
                    style={{
                      background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`
                    }}
                  >
                    {(data.name || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Main info section */}
              <div className="flex-1">
                <h1
                  className="text-2xl font-bold mb-2 tracking-tight"
                  style={{
                    color: mergedColors.primary,
                    fontFamily: safeStyles.fontFamily,
                    fontSize: safeStyles.fontSize === "11pt" ? "22pt" : "1.75rem"
                  }}
                >
                  {data.name || "Your Name"}
                </h1>

                <p
                  className="text-base font-medium mb-4"
                  style={{
                    color: mergedColors.secondary,
                    fontFamily: safeStyles.fontFamily,
                    fontSize: safeStyles.fontSize === "11pt" ? "13pt" : "1rem"
                  }}
                >
                  {data.jobTitle || ""}
                </p>

                {/* Contact grid - compact for resume */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: mergedColors.accent }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <span style={{ color: mergedColors.text, fontSize: safeStyles.fontSize || "11pt" }}>{data.email || "email@example.com"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: mergedColors.accent }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span style={{ color: mergedColors.text, fontSize: safeStyles.fontSize || "11pt" }}>{data.phone || "+1 (555) 123-4567"}</span>
                  </div>

                  {data.address && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: mergedColors.accent }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span style={{ color: mergedColors.text, fontSize: safeStyles.fontSize || "11pt" }}>{data.address}</span>
                    </div>
                  )}

                  {/* LinkedIn and Portfolio links */}
                  {data.linkedin && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: mergedColors.accent }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span style={{ color: mergedColors.text, fontSize: safeStyles.fontSize || "11pt" }}>{data.linkedin}</span>
                    </div>
                  )}

                  {data.portfolio && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: mergedColors.accent }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span style={{ color: mergedColors.text, fontSize: safeStyles.fontSize || "11pt" }}>{data.portfolio}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }

    // SPLIT HEADER - Asymmetric modern design
    if (safeLayout.headerStyle === "split-header") {
      return (
        <header className="mb-6 grid grid-cols-3 gap-4 items-center">
          <div className="col-span-2">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg font-medium mb-3"
              style={{ color: mergedColors.secondary }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="space-y-1 text-sm">
              <div style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</div>
              <div style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div style={{ color: mergedColors.text }}>{data.address}</div>}
            </div>
          </div>
          <div className="flex justify-end">
            {data.photo ? (
              <img
                src={data.photo}
                alt="Profile"
                className="w-24 h-24 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: mergedColors.accent }}
              >
                {(data.name || "YN").split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>
        </header>
      );
    }

    // COMPACT - Clean and simple
    if (safeLayout.headerStyle === "compact") {
      return (
        <header className="mb-6 p-4 border-b-2" style={{ borderColor: mergedColors.accent }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {data.photo && (
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-14 h-14 rounded-lg object-cover border-2"
                  style={{ borderColor: mergedColors.accent }}
                />
              )}
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: safeStyles.fontFamily, color: mergedColors.primary }}
                >
                  {data.name || "Your Name"}
                </h1>
                <p className="text-lg" style={{ color: mergedColors.secondary }}>
                  {data.jobTitle || ""}
                </p>
              </div>
            </div>
            <div className="text-right text-sm space-y-1" style={{ color: mergedColors.text }}>
              <div>{data.email || "email@example.com"}</div>
              <div>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div>{data.address}</div>}
              {data.linkedin && <div>{data.linkedin}</div>}
              {data.portfolio && <div>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    // TECH HEADER - Simple modern header for tech templates
    if (safeLayout.headerStyle === "tech-header") {
      return (
        <header className="mb-6 p-4 bg-gray-50 rounded-lg" style={{ backgroundColor: mergedColors.code || "#f9fafb" }}>
          <div className="flex items-center space-x-4">
            {data.photo && (
              <img
                src={data.photo}
                alt="Profile"
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1
                className="text-xl font-semibold"
                style={{ fontFamily: safeStyles.fontFamily, color: mergedColors.primary }}
              >
                {data.name || "Your Name"}
              </h1>
              <p className="text-base" style={{ color: mergedColors.secondary }}>
                {data.jobTitle || ""}
              </p>
              <div className="flex space-x-4 text-sm mt-1" style={{ color: mergedColors.text }}>
                <span>{data.email || "email@example.com"}</span>
                <span>{data.phone || "+1 (555) 123-4567"}</span>
              </div>
            </div>
          </div>
        </header>
      );
    }

    // FULL-WIDTH HEADER - Enhanced modern design
    if (safeLayout.headerStyle === "full-width") {
      return (
        <header
          className="mb-6 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 50%, ${mergedColors.secondary} 100%)`,
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Enhanced decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}>
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)" }}>
            </div>
          </div>

          {/* Modern geometric pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="modern-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                  <rect x="8" y="8" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modern-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {data.photo && (
                <div className="relative">
                  <img
                    src={data.photo}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-white opacity-20"></div>
                </div>
              )}
              <div>
                <h1
                  className="text-4xl font-bold mb-2 tracking-tight"
                  style={{
                    color: "#ffffff",
                    fontFamily: safeStyles.fontFamily,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  {data.name || "Your Name"}
                </h1>
                <p
                  className="text-xl font-medium mb-3 opacity-95"
                  style={{
                    color: "#ffffff",
                    fontFamily: safeStyles.fontFamily,
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                  }}
                >
                  {data.jobTitle || ""}
                </p>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{data.email || "email@example.com"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{data.phone || "+1 (555) 123-4567"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2 text-sm opacity-85">
              {data.address && (
                <div className="flex items-center justify-end space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{data.address}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center justify-end space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">{data.linkedin}</span>
                </div>
              )}
              {data.portfolio && (
                <div className="flex items-center justify-end space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">{data.portfolio}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ============================
    // ATS-SPECIFIC HEADER STYLES
    // ============================

    // ATS STANDARD HEADER - Space-efficient, ATS-friendly
    if (safeLayout.headerStyle === "standard") {
      return (
        <header className="mb-6 text-center">
          {/* Name and job title in compact layout */}
          <div className="mb-3">
            <h1
              className="text-3xl font-bold mb-1 tracking-tight"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: "700",
                letterSpacing: "-0.01em"
              }}
            >
              {data.name || "Your Name"}
            </h1>

            {/* Simple separator line */}
            <div className="flex items-center justify-center mb-2">
              <div
                className="h-0.5 w-12"
                style={{ background: mergedColors.accent }}
              ></div>
            </div>

            <p
              className="text-base font-medium tracking-wide"
              style={{
                color: mergedColors.secondary,
                fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: "500",
                letterSpacing: "0.02em"
              }}
            >
              {data.jobTitle || ""}
            </p>
          </div>

          {/* Contact information in efficient horizontal layout */}
          <div className="text-sm">
            {/* Primary contact row - email and phone */}
            <div className="flex justify-center items-center space-x-5 mb-1.5">
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.email || "email@example.com"}
              </span>
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.phone || "+1 (555) 123-4567"}
              </span>
            </div>

            {/* Secondary contact row - address and web presence */}
            <div className="flex justify-center items-center space-x-5">
              {data.address && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.address}
                </span>
              )}
              {data.linkedin && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.linkedin}
                </span>
              )}
              {data.portfolio && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.portfolio}
                </span>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS PROFESSIONAL HEADER - Space-efficient business style
    if (safeLayout.headerStyle === "professional") {
      return (
        <header className="mb-6 text-center">
          {/* Name and job title in compact layout */}
          <div className="mb-3">
            <h1
              className="text-3xl font-bold mb-1 tracking-tight"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "700",
                letterSpacing: "-0.01em"
              }}
            >
              {data.name || "Your Name"}
            </h1>

            {/* Compact separator */}
            <div className="flex items-center justify-center mb-2">
              <div
                className="h-0.5 w-16 rounded-full"
                style={{ background: mergedColors.accent }}
              ></div>
            </div>

            <p
              className="text-base font-medium tracking-wide"
              style={{
                color: mergedColors.secondary,
                fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: "500",
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}
            >
              {data.jobTitle || ""}
            </p>
          </div>

          {/* Contact information in efficient horizontal layout */}
          <div className="text-sm">
            {/* Primary contact row - email and phone */}
            <div className="flex justify-center items-center space-x-5 mb-1.5">
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.email || "email@example.com"}
              </span>
              <span
                className="font-medium"
                style={{ color: mergedColors.text }}
              >
                {data.phone || "+1 (555) 123-4567"}
              </span>
            </div>

            {/* Secondary contact row - address and web presence */}
            <div className="flex justify-center items-center space-x-5">
              {data.address && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.address}
                </span>
              )}
              {data.linkedin && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.linkedin}
                </span>
              )}
              {data.portfolio && (
                <span
                  className="font-medium"
                  style={{ color: mergedColors.text }}
                >
                  {data.portfolio}
                </span>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS TECH HEADER - Monospace font for technical roles
    if (safeLayout.headerStyle === "tech") {
      return (
        <header className="mb-6 border-b-2 border-gray-400 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-mono mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                fontWeight: "600"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3 font-mono"
              style={{
                color: mergedColors.secondary,
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace"
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex flex-col items-center space-y-1 text-sm font-mono">
              {/* Primary contact info */}
              <div className="flex justify-center items-center space-x-4">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <span>|</span>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <>
                    <span>|</span>
                    <span style={{ color: mergedColors.text }}>{data.address}</span>
                  </>
                )}
              </div>
              {/* Personal details and web presence */}
              {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                <div className="flex justify-center items-center space-x-4">
                  {data.dateOfBirth && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                    </>
                  )}
                  {data.gender && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.gender}</span>
                    </>
                  )}
                  {data.maritalStatus && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                    </>
                  )}
                  {data.linkedin && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                    </>
                  )}
                  {data.portfolio && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS FINANCE HEADER - Traditional financial style
    if (safeLayout.headerStyle === "finance") {
      return (
        <header className="mb-6 border-b-4 border-gray-900 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-serif mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Times New Roman', serif",
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-4"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS HEALTHCARE HEADER - Medical professional style
    if (safeLayout.headerStyle === "healthcare") {
      return (
        <header className="mb-6 border-b-2 border-blue-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS MARKETING HEADER - Creative marketing style
    if (safeLayout.headerStyle === "marketing") {
      return (
        <header className="mb-6 border-b-2 border-purple-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex flex-col items-center space-y-1 text-sm">
              {/* Primary contact info */}
              <div className="flex justify-center items-center space-x-4">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <span>|</span>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <>
                    <span>|</span>
                    <span style={{ color: mergedColors.text }}>{data.address}</span>
                  </>
                )}
              </div>
              {/* Personal details and web presence */}
              {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                <div className="flex justify-center items-center space-x-4">
                  {data.dateOfBirth && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                    </>
                  )}
                  {data.gender && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.gender}</span>
                    </>
                  )}
                  {data.maritalStatus && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                    </>
                  )}
                  {data.linkedin && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                    </>
                  )}
                  {data.portfolio && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS ENTRY-LEVEL HEADER - Student/graduate style
    if (safeLayout.headerStyle === "entry-level") {
      return (
        <header className="mb-6 border-b-2 border-green-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS STUDENT HEADER - Academic style
    if (safeLayout.headerStyle === "student") {
      return (
        <header className="mb-6 border-b-2 border-blue-500 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS EXECUTIVE HEADER - Senior executive style
    if (safeLayout.headerStyle === "executive") {
      return (
        <header className="mb-6 border-b-4 border-gray-800 pb-4">
          <div className="text-center">
            <h1
              className="text-4xl font-serif mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <div
              className="w-32 h-1 mx-auto mb-3"
              style={{ background: mergedColors.primary }}
            ></div>
            <p
              className="text-xl mb-4"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex flex-col items-center space-y-1 text-sm font-medium">
              {/* Primary contact info */}
              <div className="flex justify-center items-center space-x-4">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span style={{ color: mergedColors.text }}>{data.address}</span>
                  </>
                )}
              </div>
              {/* Personal details and web presence */}
              {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                <div className="flex justify-center items-center space-x-4">
                  {data.dateOfBirth && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                    </>
                  )}
                  {data.gender && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      <span style={{ color: mergedColors.text }}>{data.gender}</span>
                    </>
                  )}
                  {data.maritalStatus && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                    </>
                  )}
                  {data.linkedin && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                    </>
                  )}
                  {data.portfolio && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS C-LEVEL HEADER - Board-level executive style
    if (safeLayout.headerStyle === "c-level") {
      return (
        <header className="mb-6 border-b-4 border-gray-900 pb-4">
          <div className="text-center">
            <h1
              className="text-4xl font-serif mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Times New Roman', serif",
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <div
              className="w-40 h-1 mx-auto mb-3"
              style={{ background: mergedColors.primary }}
            ></div>
            <p
              className="text-xl mb-4"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm font-medium">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS LEGAL HEADER - Legal professional style
    if (safeLayout.headerStyle === "legal") {
      return (
        <header className="mb-6 border-b-4 border-gray-800 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-serif mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: "'Times New Roman', serif",
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-4"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm font-medium">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS CONSULTING HEADER - Consulting professional style
    if (safeLayout.headerStyle === "consulting") {
      return (
        <header className="mb-6 border-b-2 border-blue-800 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS MECHANICAL ENGINEER HEADER - Engineering professional style
    if (safeLayout.headerStyle === "mechanical") {
      return (
        <header className="mb-6 border-b-2 border-gray-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS SALES PROFESSIONAL HEADER - Sales professional style
    if (safeLayout.headerStyle === "sales") {
      return (
        <header className="mb-6 border-b-2 border-green-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex flex-col items-center space-y-1 text-sm">
              {/* Primary contact info */}
              <div className="flex justify-center items-center space-x-4">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <span>|</span>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <>
                    <span>|</span>
                    <span style={{ color: mergedColors.text }}>{data.address}</span>
                  </>
                )}
              </div>
              {/* Personal details and web presence */}
              {(data.dateOfBirth || data.gender || data.maritalStatus || data.linkedin || data.portfolio) && (
                <div className="flex justify-center items-center space-x-4">
                  {data.dateOfBirth && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                    </>
                  )}
                  {data.gender && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.gender}</span>
                    </>
                  )}
                  {data.maritalStatus && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                    </>
                  )}
                  {data.linkedin && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                    </>
                  )}
                  {data.portfolio && (
                    <>
                      <span>|</span>
                      <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS HR SPECIALIST HEADER - Human resources style
    if (safeLayout.headerStyle === "hr") {
      return (
        <header className="mb-6 border-b-2 border-purple-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS PROJECT MANAGER HEADER - Project management style
    if (safeLayout.headerStyle === "project-manager") {
      return (
        <header className="mb-6 border-b-2 border-orange-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS DATA SCIENTIST HEADER - Data science style
    if (safeLayout.headerStyle === "data-scientist") {
      return (
        <header className="mb-6 border-b-2 border-indigo-600 pb-4">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className="text-lg mb-3"
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
              <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ATS CREATIVE DESIGNER HEADER - Creative design style
    if (safeLayout.headerStyle === "creative") {
      return (
        <header
          className="mb-6 p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`,
            color: "#ffffff"
          }}
        >
          {/* Creative background pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="creative-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#creative-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-6">
            {data.photo && (
              <div className="flex-shrink-0">
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  fontFamily: safeStyles.fontFamily,
                  background: "linear-gradient(45deg, #fff, #f0f0f0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p className="text-xl font-medium mb-3 opacity-90">
                {data.jobTitle || ""}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm opacity-85">
                <div>{data.email || "email@example.com"}</div>
                <div>{data.phone || "+1 (555) 123-4567"}</div>
                {data.address && <div className="col-span-2">{data.address}</div>}
              </div>
            </div>
          </div>
        </header>
      );
    }

    // ATS PROFESSIONAL PROFILE HEADER - Profile picture on left side
    if (safeLayout.headerStyle === "profile-left") {
      return (
        <header className="mb-6 pb-4 border-b border-gray-300">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-lg mb-3"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "500"
                }}
              >
                {data.jobTitle || ""}
              </p>
              {/* Contact Information - Two Columns Without Labels */}
              <div className="flex gap-8 mt-2">
                {/* Basic Contact Column */}
                <div className="flex flex-col gap-1 text-sm flex-1" style={{ color: mergedColors.text }}>
                  {data.address && <div>{data.address}</div>}
                  {data.phone && <div>{data.phone}</div>}
                  {data.email && <div>{data.email}</div>}
                </div>

                {/* Web Presence Column */}
                {(data.website || data.portfolio || data.linkedin) && (
                  <div className="flex flex-col gap-1 text-sm flex-1" style={{ color: mergedColors.text }}>
                    {(data.website || data.portfolio) && <div className="break-all">{data.website || data.portfolio}</div>}
                    {data.linkedin && <div className="break-all">{data.linkedin}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Picture - Moved to Right */}
            {data.photo ? (
              <div className="flex-shrink-0">
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-gray-200 shadow-sm flex items-center justify-center">
                  <span className="text-5xl text-gray-400">👤</span>
                </div>
              </div>
            )}
          </div>
        </header>
      );
    }

    // ATS TWO-COLUMN EXECUTIVE HEADER - Two-column layout with beige sidebar
    if (safeLayout.headerStyle === "executive-two-column") {
      return (
        <header className="mb-6">
          <div className="flex items-start gap-6">
            {data.photo && (
              <div className="flex-shrink-0">
                <img
                  src={data.photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
              </div>
            )}
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2 uppercase tracking-wide"
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-lg font-semibold mb-3 uppercase tracking-wide"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "600"
                }}
              >
                {data.jobTitle || ""}
              </p>

              {/* Contact Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                <span style={{ color: mergedColors.text }}>{data.email || "email@example.com"}</span>
                <span style={{ color: mergedColors.text }}>{data.phone || "+1 (555) 123-4567"}</span>
                {data.address && (
                  <span style={{ color: mergedColors.text }}>{data.address}</span>
                )}
              </div>

              {/* Personal Information - DOB, Gender, Marital Status */}
              {(data.dateOfBirth || data.gender || data.maritalStatus) && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {data.dateOfBirth && (
                    <span style={{ color: mergedColors.text }}>DOB: {data.dateOfBirth}</span>
                  )}
                  {data.gender && (
                    <span style={{ color: mergedColors.text }}>{data.gender}</span>
                  )}
                  {data.maritalStatus && (
                    <span style={{ color: mergedColors.text }}>{data.maritalStatus}</span>
                  )}
                </div>
              )}

              {/* Web Presence */}
              {(data.linkedin || data.portfolio) && (
                <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                  {data.linkedin && (
                    <span style={{ color: mergedColors.text }}>{data.linkedin}</span>
                  )}
                  {data.portfolio && (
                    <span style={{ color: mergedColors.text }}>{data.portfolio}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      );
    }



    // ONE-PAGER MODERN HEADER - Modern one-pager style with colored background
    if (safeLayout.headerStyle === "onepager-modern") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} rounded-lg text-white`} style={{ backgroundColor: mergedColors.primary }}>
          <div className="text-center">
            <h1
              className={`text-xl font-semibold ${spacing.titleMargin}`}
              style={{
                color: "#ffffff",
                fontFamily: safeStyles.fontFamily,
                fontWeight: "600"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className={`text-sm ${spacing.textMargin}`}
              style={{
                color: "#ffffff",
                fontFamily: safeStyles.fontFamily,
                opacity: "0.9"
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs" style={{ opacity: "0.85" }}>
              <span style={{ color: "#ffffff" }}>{data.email || "email@example.com"}</span>
              <span style={{ color: "#ffffff" }}>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.address}</span>
                </>
              )}
              {data.linkedin && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.linkedin}</span>
                </>
              )}
              {data.portfolio && (
                <>
                  <span style={{ color: "#ffffff" }}>{data.portfolio}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // ONE-PAGER TWO-COLUMN HEADER - Two-column one-pager style
    if (safeLayout.headerStyle === "onepager-two-column") {
      return (
        <header className={`${spacing.headerMargin} pb-3`}>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="text-left">
              <h1
                className={`text-xl font-bold ${spacing.titleMargin}`}
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ color: mergedColors.text }}>
              <div>{data.email || "email@example.com"}</div>
              <div>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div>{data.address}</div>}
              {data.linkedin && <div>{data.linkedin}</div>}
              {data.portfolio && <div>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    // ONE-PAGER TECH HEADER - Tech one-pager style with gradient background
    if (safeLayout.headerStyle === "onepager-tech") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} rounded-lg text-white`} style={{
          background: `linear-gradient(90deg, ${mergedColors.primary} 0%, ${mergedColors.accent} 100%)`
        }}>
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-xl font-semibold ${spacing.titleMargin}`}
                style={{
                  color: "#ffffff",
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "600"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: "#ffffff",
                  fontFamily: safeStyles.fontFamily,
                  opacity: "0.9"
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ opacity: "0.85" }}>
              <div style={{ color: "#ffffff" }}>{data.email || "email@example.com"}</div>
              <div style={{ color: "#ffffff" }}>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div style={{ color: "#ffffff" }}>{data.address}</div>}
            </div>
          </div>
        </header>
      );
    }

    // ONE-PAGER SALES HEADER - Sales one-pager style with accent border
    if (safeLayout.headerStyle === "onepager-sales") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} bg-gray-50 rounded-lg`} style={{ borderLeft: `4px solid ${mergedColors.accent}` }}>
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-xl font-bold ${spacing.titleMargin}`}
                style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontWeight: "700"
                }}
              >
                {data.name || "Your Name"}
              </h1>
              <p
                className="text-sm"
                style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}
              >
                {data.jobTitle || ""}
              </p>
            </div>
            <div className="text-right text-xs" style={{ color: mergedColors.text }}>
              <div>{data.email || "email@example.com"}</div>
              <div>{data.phone || "+1 (555) 123-4567"}</div>
              {data.address && <div>{data.address}</div>}
              {data.linkedin && <div>{data.linkedin}</div>}
              {data.portfolio && <div>{data.portfolio}</div>}
            </div>
          </div>
        </header>
      );
    }

    // ONE-PAGER FINANCE HEADER - Finance one-pager style with bordered design
    if (safeLayout.headerStyle === "onepager-finance") {
      return (
        <header className={`${spacing.headerMargin} ${spacing.padding} border-2 rounded-lg`} style={{
          borderColor: mergedColors.primary,
          borderStyle: "solid"
        }}>
          <div className="text-center">
            <h1
              className={`text-xl font-bold ${spacing.titleMargin}`}
              style={{
                color: mergedColors.primary,
                fontFamily: safeStyles.fontFamily,
                fontWeight: "700"
              }}
            >
              {data.name || "Your Name"}
            </h1>
            <p
              className={`text-sm ${spacing.textMargin}`}
              style={{
                color: mergedColors.secondary,
                fontFamily: safeStyles.fontFamily
              }}
            >
              {data.jobTitle || ""}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs" style={{ color: mergedColors.text }}>
              <span>{data.email || "email@example.com"}</span>
              <span>{data.phone || "+1 (555) 123-4567"}</span>
              {data.address && (
                <>
                  <span>{data.address}</span>
                </>
              )}
              {data.linkedin && (
                <>
                  <span>{data.linkedin}</span>
                </>
              )}
              {data.portfolio && (
                <>
                  <span>{data.portfolio}</span>
                </>
              )}
            </div>
          </div>
        </header>
      );
    }

    // USER'S ORIGINAL DEFAULT HEADER STYLE - with decorative SVG elements
    const headerStyleFinal = headerBaseStyle;
    return (
      <header
        className="p-4 rounded-t-lg shadow-md text-white relative overflow-hidden"
        style={headerStyleFinal}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 Q50,50 100,0" stroke={mergedColors.accent} strokeWidth="2" fill="none" />
            <path d="M0,100 Q50,50 100,100" stroke={mergedColors.accent} strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            {data.photo && (
              <img
                src={data.photo}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
            )}
            <div>
              {data.name && (
                <h1
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
                >
                  {data.name}
                </h1>
              )}
              {data.jobTitle && (
                <p
                  className="text-sm font-medium mt-0.5 opacity-90"
                  style={{ color: "#ffffff", fontFamily: safeStyles.fontFamily }}
                >
                  {data.jobTitle}
                </p>
              )}
            </div>
          </div>
          <div
            className="text-xs space-y-1 text-right"
            style={{
              color: "#ffffff",
              fontFamily: safeStyles.fontFamily,
              whiteSpace: "normal"
            }}
          >
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.address && <p>{data.address}</p>}
            {data.dateOfBirth && (
              <p style={{ opacity: 0.95 }}>DOB: {data.dateOfBirth}</p>
            )}
            {data.gender && (
              <p style={{ opacity: 0.95 }}>{data.gender}</p>
            )}
            {data.maritalStatus && (
              <p style={{ opacity: 0.95 }}>{data.maritalStatus}</p>
            )}
            {data.linkedin && (
              <p style={{ opacity: 0.95 }}>{data.linkedin}</p>
            )}
            {data.portfolio && (
              <p style={{ opacity: 0.95 }}>{data.portfolio}</p>
            )}
          </div>
        </div>
      </header>
    );
  };

  const renderLayout = () => {
    const { sectionsOrder, columns, sidebarSections, mainSections } = safeLayout;

    // Check if this is an ATS template and use the dedicated ATS renderer
    // Check both the template prop and templateKey for ATS templates
    const isATSTemplate = (template && template.startsWith('ats_')) || (templateKey && templateKey.includes('ats_'));

    // Check for Visual Appeal templates (using top-level constant)
    if (isVisualAppealTemplate) {
      // Get the template data for Visual Appeal templates
      let templateData = templates[template] || templates[templateKey];

      if (!templateData) {
        console.error('ResumePreview - Visual Appeal Template not found:', template);
        return (
          <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Visual Appeal Template Error</h2>
            <p>Could not find Visual Appeal template: {template}</p>
          </div>
        );
      }

      return (
        <VisualAppealRenderer
          data={data}
          template={templateData}
          isCompact={isCompactMode}
          isPremium={isPremium}
        />
      );
    }

    if (isATSTemplate) {
      // Get the template data - try template first, then templateKey, then fallback
      // For ATS templates, we want to use the template name directly, not the country-prefixed key
      let templateData = templates[template] || atsFriendlyTemplates[template];

      // If template is not found directly, try to find it by name
      if (!templateData && template && template.startsWith('ats_')) {
        // Look for ATS templates by name to ensure we get the right one
        const availableATS = Object.keys(atsFriendlyTemplates).filter(key => key.startsWith('ats_'));
        console.log('ResumePreview - ATS Template Lookup:', {
          requestedTemplate: template,
          availableATS,
          foundDirect: !!(templates[template] || atsFriendlyTemplates[template])
        });

        // Try to find by exact name match in ATS templates
        templateData = atsFriendlyTemplates[template];

        // If still not found, this indicates a serious issue
        if (!templateData) {
          console.error('ResumePreview - ATS Template not found:', template);
          return (
            <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-bold mb-2">ATS Template Error</h2>
              <p>Could not find ATS template: {template}</p>
              <p className="text-sm mt-2">Available ATS Templates: {availableATS.join(', ')}</p>
            </div>
          );
        }
      }

      // Fallback to templateKey if still needed
      if (!templateData) {
        templateData = templates[templateKey.replace(/^[a-z]{2}_/, '')] || templates[templateKey] ||
          atsFriendlyTemplates[templateKey.replace(/^[a-z]{2}_/, '')] || atsFriendlyTemplates[templateKey];
      }

      // Debug logging disabled to prevent console flooding
      // console.log('ResumePreview - ATS Template Selection Debug:', {
      //   template,
      //   templateKey,
      //   templateData: templateData ? templateData.name : 'undefined',
      //   availableATS: Object.keys(atsFriendlyTemplates).filter(key => key.startsWith('ats_')),
      //   foundTemplate: templateData ? templateData.layout?.headerStyle : 'undefined',
      //   templateStyles: templateData ? templateData.styles : 'undefined'
      // });

      // Check if templateData is undefined and provide fallback
      if (!templateData) {
        console.error('ResumePreview - Template data not found for:', { template, templateKey });
        return (
          <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Template Not Found</h2>
            <p>Could not find template data for: {template}</p>
            <p className="text-sm mt-2">Template Key: {templateKey}</p>
            <p className="text-sm">Available ATS Templates: {Object.keys(atsFriendlyTemplates).filter(key => key.startsWith('ats_')).join(', ')}</p>
          </div>
        );
      }

      return (
        <ATSResumeRenderer
          data={data}
          template={templateData}
          isCompact={isCompactMode}
        />
      );
    }

    // Simple single column layout
    if (columns === 1) {
      return (
        <div className="space-y-4 w-full relative" style={{ fontFamily: safeStyles.fontFamily, background: mergedColors.background, color: mergedColors.text, width: '100%' }}>
          {renderHeader()}
          {sectionsOrder.map(section => renderSection(section)).filter(Boolean)}
          {/* Enhanced Drop zone for adding sections at the end - Only show in editor mode */}
          {isReorderEditor && isDragEnabled && (
            <div
              className={`h-12 border-2 border-dashed rounded-lg transition-all duration-300 flex items-center justify-center ${dragOverTarget === 'end'
                ? 'border-green-500 bg-green-100 shadow-lg scale-105'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
              onDragOver={(e) => handleDragOver(e, 'end')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'end')}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${dragOverTarget === 'end' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={`text-sm font-medium transition-colors duration-300 ${dragOverTarget === 'end' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                  Drop Section Here
                </span>
              </div>
            </div>
          )}
          {!isPremium && (
            <div
              className="watermark"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-45deg)",
                fontSize: "2.5rem",
                color: "rgba(0, 0, 0, 0.15)",
                fontFamily: safeStyles.fontFamily,
                pointerEvents: "none",
                zIndex: 1000,
                textAlign: "center",
                whiteSpace: "nowrap",
                fontWeight: "600",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              Generated by ExpertResume
            </div>
          )}
        </div>
      );
    }

    // Enhanced two column layout with graceful drag and drop
    const sidebarWidth = safeLayout.sidebarWidth || "30%";
    const mainWidth = `${100 - parseInt(sidebarWidth)}%`;

    // Determine which container is being dragged over for better visual feedback
    const isDraggingOverSidebar = dragOverTarget && (
      dragOverTarget === 'sidebar-end' ||
      (sidebarSections && sidebarSections.includes(dragOverTarget))
    );
    const isDraggingOverMain = dragOverTarget && (
      dragOverTarget === 'main-end' ||
      (mainSections && mainSections.includes(dragOverTarget))
    );

    return (
      <div className="w-full relative" style={{ fontFamily: safeStyles.fontFamily, background: mergedColors.background, color: mergedColors.text, width: '100%' }}>
        {renderHeader()}
        <div className="grid" style={{ gridTemplateColumns: `${sidebarWidth} ${mainWidth}`, gap: "1.5rem", alignItems: "start" }}>
          {/* Sidebar Container with Enhanced Drag Feedback */}
          <div
            className={`space-y-4 transition-all duration-300 ${isDraggingOverSidebar
              ? 'ring-2 ring-blue-400 ring-opacity-60 bg-blue-50/30'
              : ''
              }`}
            style={{
              background: isDraggingOverSidebar
                ? 'rgba(59, 130, 246, 0.05)'
                : (safeLayout.sidebar || mergedColors.sidebarBg || "#f8fafc"),
              fontFamily: safeStyles.fontFamily,
              padding: "1.5rem",
              borderRadius: "8px",
              border: isDraggingOverSidebar
                ? `2px dashed ${mergedColors.accent || '#3b82f6'}`
                : `1px solid ${mergedColors.timeline || "#e5e7eb"}`,
              marginTop: "0",
              position: "relative"
            }}
          >
            {/* Sidebar Drop Zone Indicator */}
            {isReorderEditor && isDragEnabled && (
              <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isDraggingOverSidebar
                ? 'opacity-100'
                : 'opacity-0'
                }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg border-2 border-dashed border-blue-300"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <span className="text-sm font-medium">Drop in Sidebar</span>
                </div>
              </div>
            )}

            {sidebarSections?.map(section => renderSection(section)).filter(Boolean)}

            {/* Enhanced Drop Zone for Sidebar */}
            {isReorderEditor && isDragEnabled && (
              <div
                className={`h-12 border-2 border-dashed rounded-lg transition-all duration-300 flex items-center justify-center ${dragOverTarget === 'sidebar-end'
                  ? 'border-blue-500 bg-blue-100 shadow-lg scale-105'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                onDragOver={(e) => handleDragOver(e, 'sidebar-end')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'sidebar-end', 'sidebar')}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${dragOverTarget === 'sidebar-end' ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`text-sm font-medium transition-colors duration-300 ${dragOverTarget === 'sidebar-end' ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                    Drop in Sidebar
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Container with Enhanced Drag Feedback */}
          <div
            className={`space-y-4 transition-all duration-300 ${isDraggingOverMain
              ? 'ring-2 ring-purple-400 ring-opacity-60 bg-purple-50/30'
              : ''
              }`}
            style={{
              background: isDraggingOverMain
                ? 'rgba(147, 51, 234, 0.05)'
                : 'transparent',
              fontFamily: safeStyles.fontFamily,
              color: mergedColors.text,
              paddingTop: "1.5rem",
              paddingRight: "0.75rem",
              position: "relative"
            }}
          >
            {/* Main Drop Zone Indicator */}
            {isReorderEditor && isDragEnabled && (
              <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isDraggingOverMain
                ? 'opacity-100'
                : 'opacity-0'
                }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-lg border-2 border-dashed border-purple-300"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <span className="text-sm font-medium">Drop in Main Area</span>
                </div>
              </div>
            )}

            {mainSections?.map(section => renderSection(section)).filter(Boolean)}

            {/* Enhanced Drop Zone for Main Content */}
            {isReorderEditor && isDragEnabled && (
              <div
                className={`h-12 border-2 border-dashed rounded-lg transition-all duration-300 flex items-center justify-center ${dragOverTarget === 'main-end'
                  ? 'border-purple-500 bg-purple-100 shadow-lg scale-105'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                onDragOver={(e) => handleDragOver(e, 'main-end')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'main-end', 'main')}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${dragOverTarget === 'main-end' ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className={`text-sm font-medium transition-colors duration-300 ${dragOverTarget === 'main-end' ? 'text-purple-700' : 'text-gray-600'
                    }`}>
                    Drop in Main Area
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        {!isPremium && (
          <div
            className="watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "2.5rem",
              color: "rgba(0, 0, 0, 0.15)",
              fontFamily: safeStyles.fontFamily,
              pointerEvents: "none",
              zIndex: 1000,
              textAlign: "center",
              whiteSpace: "nowrap",
              fontWeight: "600",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            Generated by ExpertResume
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section) => {
    // Simple existence checks only
    if (section === "summary" && !data.summary?.trim()) return null;
    if (section === "experience" && (!data.experience?.length)) return null;
    if (section === "education" && (!data.education?.length)) return null;
    if (section === "skills" && (!data.skills?.length)) return null;
    if (section === "certifications" && (!data.certifications?.length)) return null;
    if (section === "languages" && (!data.languages?.length)) return null;
    if (section === "customSections" && (!data.customSections?.length)) return null;

    // Skip unknown sections
    const knownSections = ["summary", "experience", "education", "skills", "certifications", "languages", "customSections"];
    if (!knownSections.includes(section)) return null;

    // Skip sections without proper translations (except customSections)
    if (section !== "customSections" && (!t[section] || !t[section].trim())) return null;

    const sectionStyle = {
      marginBottom: "1.5rem",
      fontFamily: safeStyles.fontFamily,
    };

    return (
      <section
        key={section}
        data-section={section}
        className={`resume-section transition-all duration-300 ${isReorderEditor && isDragEnabled ? (isMobile ? 'touch-manipulation select-none' : 'cursor-move') : ''} ${isReorderEditor && draggedSection === section ? 'opacity-50' : ''} ${isReorderEditor && dragOverTarget === section ? 'ring-2 ring-blue-400 ring-opacity-60 bg-blue-50/50 scale-105 shadow-lg' : ''} ${isReorderEditor && isDragging && draggedSection === section ? 'transform scale-105 shadow-xl z-10' : ''} ${isReorderEditor && isCompactMode ? 'compact-mode' : ''} ${isReorderEditor && showTutorial && tutorialStep === 1 ? 'ring-2 ring-blue-300 ring-opacity-50 animate-pulse' : ''} ${isReorderEditor && showTutorial && tutorialStep === 2 ? 'ring-2 ring-blue-300 ring-opacity-50' : ''} ${isReorderEditor && showTutorial && tutorialStep === 3 ? 'ring-2 ring-blue-300 ring-opacity-50 hover:ring-blue-400' : ''}`}
        style={{
          ...sectionStyle,
          ...(ENABLE_DRAG_AND_DROP && isDragging && draggedSection === section ? {
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.05)`,
            transition: 'none',
            zIndex: 1000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          } : {}),
          ...(ENABLE_DRAG_AND_DROP && isCompactMode ? {
            marginBottom: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          } : {})
        }}
        draggable={isReorderEditor && isDragEnabled && !isMobile}
        onDragStart={isReorderEditor && !isMobile ? (e) => handleDragStart(e, section) : undefined}
        onDragOver={isReorderEditor && !isMobile ? (e) => handleDragOver(e, section) : undefined}
        onDragLeave={isReorderEditor && !isMobile ? handleDragLeave : undefined}
        onDrop={isReorderEditor && !isMobile ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggedSection && draggedSection !== section) {
            handleDrop(draggedSection, section);
          }
        } : undefined}
        onDragEnd={isReorderEditor && !isMobile ? handleDragEnd : undefined}
        onTouchStart={isReorderEditor && isMobile ? (e) => handleTouchStart(e, section) : undefined}
        onTouchMove={isReorderEditor && isMobile ? handleTouchMove : undefined}
        onTouchEnd={isReorderEditor && isMobile ? handleTouchEnd : undefined}
      >
        {section !== "customSections" && (
          <h2
            className="text-lg font-bold mb-3 flex items-center gap-1 pb-2 border-b border-gray-100"
            style={{
              color: mergedColors.primary,
              fontFamily: safeStyles.fontFamily,
              fontSize: safeStyles.fontSize,
              lineHeight: safeStyles.lineHeight
            }}
          >
            {safeLayout.showIcons && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {iconMap[sectionIconMap[section]] || null}
              </span>
            )}
            <span className="flex-1 leading-none">{t[section]}</span>
            {isReorderEditor && isDragEnabled && (
              <span className={`flex-shrink-0 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors ${showTutorial && tutorialStep === 1 ? 'text-blue-500 animate-bounce' : ''} ${showTutorial && tutorialStep === 3 ? 'text-blue-500 scale-110' : ''}`} title={isMobile ? "Touch and drag to reorder" : "Drag to reorder"}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M8 6h8v2H8V6zm0 5h8v2H8v-2zm0 5h8v2H8v-2z" />
                </svg>
              </span>
            )}
          </h2>
        )}

        {!isCompactMode && section === "summary" && (
          <div
            style={{
              color: mergedColors.text,
              fontFamily: safeStyles.fontFamily,
              lineHeight: safeStyles.lineHeight,
              fontSize: safeStyles.fontSize,
              whiteSpace: 'pre-line'
            }}
            dangerouslySetInnerHTML={{ __html: parseRichText(cleanText(data.summary, "summary")) }}
          />
        )}

        {!isCompactMode && section === "experience" && normalizedData.experience?.map((exp, index) => (
          <div key={index} className="mb-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative" style={{ fontFamily: safeStyles.fontFamily }}>
            {safeLayout.timelineStyle && (
              <div className="absolute left-0 top-0 h-full w-1.5 rounded-full" style={{ backgroundColor: mergedColors.accent }}>
                <div className="w-4 h-4 rounded-full absolute top-3 -left-1.5 border-2 border-white shadow-sm" style={{ backgroundColor: mergedColors.accent }}></div>
              </div>
            )}
            <div className="space-y-2 mb-2" style={{ paddingLeft: safeLayout.timelineStyle ? "1.5rem" : "0" }}>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontSize: safeStyles.fontSize
                }}>
                  {cleanText(exp.jobTitle)}, {cleanText(exp.company)}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs" style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}>
                  {exp.startDate ? formatDate(exp.startDate, preferences, language, country) : 'Present'} - {exp.endDate ? formatDate(exp.endDate, preferences, language, country) : 'Present'}
                </p>

                {exp.location && (
                  <span className="text-xs text-gray-500">
                    | {cleanText(exp.location)}
                  </span>
                )}
              </div>
            </div>
            <div className="whitespace-pre-line leading-tight" style={{
              color: mergedColors.text,
              fontFamily: safeStyles.fontFamily,
              fontSize: safeStyles.fontSize,
              lineHeight: safeStyles.lineHeight,
              paddingLeft: safeLayout.timelineStyle ? '1.5rem' : '0'
            }}>
              {renderDescriptionBullets(exp.description, template?.startsWith?.('ats_'))}
            </div>
          </div>
        ))}

        {!isCompactMode && section === "education" && data.education?.map((edu, index) => (
          <div key={index} className="mb-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative" style={{ fontFamily: safeStyles.fontFamily }}>
            {safeLayout.timelineStyle && (
              <div className="absolute left-0 top-0 h-full w-1.5 rounded-full" style={{ backgroundColor: mergedColors.accent }}>
                <div className="w-4 h-4 rounded-full absolute top-3 -left-1.5 border-2 border-white shadow-sm" style={{ backgroundColor: mergedColors.accent }}></div>
              </div>
            )}
            <div className="space-y-2" style={{ paddingLeft: safeLayout.timelineStyle ? "1.5rem" : "0" }}>
              <div>
                <h3 className="font-semibold mb-1" style={{
                  color: mergedColors.primary,
                  fontFamily: safeStyles.fontFamily,
                  fontSize: safeStyles.fontSize
                }}>
                  {cleanText(edu.institution)}
                </h3>
                <p className="text-sm" style={{
                  color: mergedColors.text,
                  fontFamily: safeStyles.fontFamily,
                  fontSize: safeStyles.fontSize
                }}>
                  {cleanText(edu.degree)} in {cleanText(edu.field)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs" style={{
                  color: mergedColors.secondary,
                  fontFamily: safeStyles.fontFamily
                }}>
                  {edu.startDate ? formatDate(edu.startDate, preferences, language, country) : 'Present'} - {edu.endDate ? formatDate(edu.endDate, preferences, language, country) : 'Present'}
                </p>

                {edu.gpa && preferences?.education?.showGPA !== false && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{
                    color: mergedColors.text,
                    fontFamily: safeStyles.fontFamily
                  }}>
                    {preferences?.education?.gpaLabel || 'GPA'}: {cleanText(edu.gpa, "numeric")}
                    {preferences?.education?.gpaScale ? `/${preferences.education.gpaScale}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {!isCompactMode && section === "skills" && data.skills && (
          <div>
            <h2 className="text-lg font-bold mb-3" style={{
              color: mergedColors.primary,
              fontFamily: safeStyles.fontFamily,
              fontSize: safeStyles.fontSize,
              lineHeight: safeStyles.lineHeight
            }}>
            </h2>
            {/* Fixed 3-column layout for ATS-Optimized templates */}
            {(() => {
              // Check if this is an ATS template with single column layout
              const isATSTemplate = template && template.startsWith('ats_');
              const shouldUseFixedColumns = isATSTemplate && safeLayout.columns === 1;

              if (shouldUseFixedColumns) {
                const totalSkills = data.skills.length;
                const fixedColumns = 3; // Always use 3 columns for ATS templates
                const skillsPerColumn = Math.ceil(totalSkills / fixedColumns);

                // Create 3 columns with skills distributed evenly
                const columns = [];
                for (let i = 0; i < fixedColumns; i++) {
                  const startIdx = i * skillsPerColumn;
                  const endIdx = Math.min(startIdx + skillsPerColumn, totalSkills);
                  const columnSkills = data.skills.slice(startIdx, endIdx);

                  columns.push(
                    <div key={i} className="flex-1 min-w-0">
                      <div className="space-y-1">
                        {columnSkills.map((skill, idx) => (
                          <div key={startIdx + idx} className="flex items-center">
                            <span className="text-xs mr-2 flex-shrink-0" style={{ color: mergedColors.accent }}>•</span>
                            <span
                              className="leading-tight break-words"
                              style={{
                                color: mergedColors.text,
                                fontFamily: safeStyles.fontFamily,
                                fontSize: safeStyles.fontSize,
                                lineHeight: safeStyles.lineHeight,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {cleanText(renderSkillWithProficiency(skill, preferences?.skills?.showProficiency))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <div className="text-xs text-blue-600 mb-2 font-semibold">
                      🎯 ATS-Optimized 3-Column Layout
                    </div>
                    <div className="grid gap-4" style={{
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      fontFamily: safeStyles.fontFamily,
                      minWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      {columns}
                    </div>
                  </div>
                );
              }

              // Default skills rendering based on preferences
              return preferences?.skills?.displayStyle === 'tags' ? (
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      background: '#E0E7FF',
                      color: '#3730A3',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontFamily: safeStyles.fontFamily
                    }}>
                      {cleanText(renderSkillWithProficiency(skill, preferences?.skills?.showProficiency))}
                    </span>
                  ))}
                </div>
              ) : preferences?.skills?.displayStyle === 'grid' ? (
                <div className="grid gap-2" style={{
                  gridTemplateColumns: safeLayout.columns === 2 ? "1fr" : preferences?.skills?.columns ? `repeat(${preferences.skills.columns}, 1fr)` : "repeat(2, 1fr)",
                  fontFamily: safeStyles.fontFamily
                }}>
                  {data.skills.map((skill, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                      <span style={{ color: mergedColors.text, fontFamily: safeStyles.fontFamily, fontSize: safeStyles.fontSize }}>
                        {cleanText(renderSkillWithProficiency(skill, preferences?.skills?.showProficiency))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : preferences?.skills?.displayStyle === 'bars' ? (
                <div className="space-y-1">
                  {data.skills.map((skill, idx) => {
                    const proficiency = skill.proficiency || 0;
                    let percent = 0;
                    const scale = preferences?.skills?.proficiencyScale || '1-5';
                    if (scale === 'percentage') {
                      percent = parseInt(proficiency, 10);
                    } else if (scale === 'beginner-expert') {
                      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
                      const index = levels.findIndex(l => l.toLowerCase() === String(proficiency).toLowerCase());
                      if (index >= 0) percent = ((index + 1) / levels.length) * 100;
                    } else {
                      // 1-5 numeric scale
                      percent = Math.min(100, (parseInt(proficiency, 10) || 0) * 20);
                    }
                    return (
                      <div key={idx} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-xs" style={{
                          fontFamily: safeStyles.fontFamily,
                          fontSize: safeStyles.fontSize,
                          lineHeight: safeStyles.lineHeight
                        }}>
                          <span style={{ color: mergedColors.text }}>{cleanText(renderSkillName(skill))}</span>
                          {preferences?.skills?.showProficiency && proficiency && (
                            <span style={{ color: mergedColors.secondary }}>{proficiency}</span>
                          )}
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${percent}%`, backgroundColor: mergedColors.accent }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {data.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-start" style={{
                      color: mergedColors.text,
                      fontFamily: safeStyles.fontFamily,
                      fontSize: safeStyles.fontSize,
                      lineHeight: safeStyles.lineHeight
                    }}>
                      <span className="mr-2 mt-0.5 flex-shrink-0">•</span>
                      <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {cleanText(renderSkillWithProficiency(skill, preferences?.skills?.showProficiency))}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {!isCompactMode && section === "certifications" && data.certifications?.map((cert, index) => (
          <div key={index} className="mb-3" style={{ fontFamily: safeStyles.fontFamily }}>
            {/* Check if this is an ATS template with single-column layout for bullet rendering */}
            {template && template.startsWith('ats_') && safeLayout.columns === 1 ? (
              <div className="flex items-start">
                <span className="text-xs mr-2 mt-1 flex-shrink-0" style={{ color: mergedColors.accent }}>•</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight" style={{
                    color: mergedColors.primary,
                    fontFamily: safeStyles.fontFamily,
                    fontSize: safeStyles.fontSize,
                    lineHeight: safeStyles.lineHeight,
                    marginBottom: '0.25rem'
                  }}>
                    {cleanText(cert.name)}
                  </h3>
                  <p className="text-xs leading-tight" style={{
                    color: mergedColors.secondary,
                    fontFamily: safeStyles.fontFamily,
                    lineHeight: safeStyles.lineHeight
                  }}>
                    {cert.issuer && cleanText(cert.issuer)}
                    {cert.issuer && cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && ' • '}
                    {cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && formatDate(cert.date, preferences, language, country)}
                  </p>
                </div>
              </div>
            ) : template && template.startsWith('ats_') && safeLayout.columns === 2 ? (
              <div className="flex items-start">
                <span className="text-xs mr-2 mt-1 flex-shrink-0" style={{ color: mergedColors.accent }}>•</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight" style={{
                    color: mergedColors.primary,
                    fontFamily: safeStyles.fontFamily,
                    fontSize: safeStyles.fontSize,
                    lineHeight: safeStyles.lineHeight,
                    marginBottom: '0.25rem'
                  }}>
                    {cleanText(cert.name)}
                  </h3>
                  <p className="text-xs leading-tight" style={{
                    color: mergedColors.secondary,
                    fontFamily: safeStyles.fontFamily,
                    lineHeight: safeStyles.lineHeight
                  }}>
                    {cert.issuer && cleanText(cert.issuer)}
                    {cert.issuer && cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && ' • '}
                    {cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' && formatDate(cert.date, preferences, language, country)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative">
                {safeLayout.timelineStyle && (
                  <div className="absolute left-0 top-0 h-full w-1.5 rounded-full" style={{ backgroundColor: mergedColors.accent }}>
                    <div className="w-4 h-4 rounded-full absolute top-3 -left-1.5 border-2 border-white shadow-sm" style={{ backgroundColor: mergedColors.accent }}></div>
                  </div>
                )}
                <div style={{ paddingLeft: safeLayout.timelineStyle ? "1.5rem" : "0" }}>
                  <h3 className="font-semibold" style={{ color: mergedColors.primary, fontFamily: safeStyles.fontFamily, fontSize: safeStyles.fontSize }}>
                    {cleanText(cert.name)}
                  </h3>
                  <p className="text-xs" style={{ color: mergedColors.secondary, fontFamily: safeStyles.fontFamily }}>
                    {cleanText(cert.issuer)}{cert.date && cert.date.trim() !== '' && cert.date.toLowerCase() !== 'ongoing' && cert.date.toLowerCase() !== 'undefined' ? ` • ${formatDate(cert.date, preferences, language, country)}` : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {!isCompactMode && section === "languages" && data.languages && (
          <div style={{ display: "grid", gridTemplateColumns: safeLayout.columns === 2 ? "1fr" : "repeat(2, 1fr)", gap: "0.5rem", fontFamily: safeStyles.fontFamily }}>
            {data.languages.map((lang, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" style={{ fontFamily: safeStyles.fontFamily }}>
                <span style={{
                  color: mergedColors.text,
                  fontFamily: safeStyles.fontFamily,
                  fontSize: safeStyles.fontSize,
                  lineHeight: safeStyles.lineHeight
                }}>
                  {cleanText(lang.language)} {lang.proficiency ? `(${cleanText(lang.proficiency)})` : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isCompactMode && section === "customSections" && data.customSections && (
          <>
            {/* Group custom sections by type */}
            {(() => {
              const groups = data.customSections.reduce((acc, current) => {
                const type = (current.type || "project").toLowerCase();
                if (!acc[type]) acc[type] = [];
                acc[type].push(current);
                return acc;
              }, {});

              return Object.entries(groups).map(([type, items], groupIdx) => {
                // Use pluralized generic header for the section
                const sectionTitle = (t[type] || type.charAt(0).toUpperCase() + type.slice(1));

                return (
                  <section key={groupIdx} className="resume-section" style={sectionStyle}>
                    <h2 className="text-base font-bold mb-2 flex items-center gap-1" style={{
                      color: mergedColors.primary,
                      fontFamily: safeStyles.fontFamily,
                      fontSize: safeStyles.fontSize,
                      lineHeight: safeStyles.lineHeight
                    }}>
                      {safeLayout.showIcons && (
                        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                          {iconMap[sectionIconMap[type]] || null}
                        </span>
                      )}
                      <span className="flex-1">{sectionTitle}</span>
                    </h2>

                    {items.map((item, itemIdx) => {
                      const itemTitle = item.name || item.title || "";
                      return (
                        <div key={itemIdx} className="mb-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative" style={{ fontFamily: safeStyles.fontFamily }}>
                          {safeLayout.timelineStyle && (
                            <div className="absolute left-0 top-0 h-full w-1.5 rounded-full" style={{ backgroundColor: mergedColors.accent }}>
                              <div className="w-4 h-4 rounded-full absolute top-3 -left-1.5 border-2 border-white shadow-sm" style={{ backgroundColor: mergedColors.accent }}></div>
                            </div>
                          )}
                          <div style={{ paddingLeft: safeLayout.timelineStyle ? "1.5rem" : "0" }}>
                            {itemTitle && (
                              <h3 className="font-semibold mb-1" style={{
                                color: mergedColors.primary,
                                fontFamily: safeStyles.fontFamily,
                                fontSize: safeStyles.fontSize
                              }}>
                                {cleanText(itemTitle)}
                              </h3>
                            )}
                            <div style={{ color: mergedColors.text, fontFamily: safeStyles.fontFamily, fontSize: safeStyles.fontSize, lineHeight: safeStyles.lineHeight }}>
                              {renderDescriptionBullets(item.description, template?.startsWith?.('ats_'), [sectionTitle, itemTitle])}
                            </div>
                            {item.technologies && (
                              <p style={{ color: mergedColors.text, fontFamily: safeStyles.fontFamily, fontSize: safeStyles.fontSize, lineHeight: safeStyles.lineHeight }}>
                                Technology Used: {cleanText(item.technologies)}
                              </p>
                            )}
                            {item.date && (
                              <p className="text-xs mt-1" style={{
                                color: mergedColors.secondary,
                                fontFamily: safeStyles.fontFamily
                              }}>
                                {formatDate(item.date, preferences, language, country)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                );
              });
            })()}
          </>
        )}

        {/* Show compact mode indicator - Only show in editor mode */}
        {isReorderEditor && isCompactMode && (
          <div className="text-xs text-gray-500 mt-1 italic">
            {section === "experience" && data.experience?.length && `${data.experience.length} position${data.experience.length > 1 ? 's' : ''}`}
            {section === "education" && data.education?.length && `${data.education.length} degree${data.education.length > 1 ? 's' : ''}`}
            {section === "skills" && data.skills?.length && `${data.skills.length} skill${data.skills.length > 1 ? 's' : ''}`}
            {section === "certifications" && data.certifications?.length && `${data.certifications.length} certification${data.certifications.length > 1 ? 's' : ''}`}
            {section === "languages" && data.languages?.length && `${data.languages.length} language${data.languages.length > 1 ? 's' : ''}`}
            {section === "summary" && "Professional summary"}
            {section === "customSections" && data.customSections?.length && (
              // Show count of custom sections without grouping
              `${data.customSections.length} custom section${data.customSections.length > 1 ? 's' : ''}`
            )}
          </div>
        )}
      </section>
    );
  };

  return (
    <div
      className="resume-preview"
      style={{
        width: "100%",
        maxWidth: "794px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        margin: "0 auto",
        overflow: "visible",
        backgroundColor: mergedColors.background,
        color: mergedColors.text,
        fontFamily: safeStyles.fontFamily || "Arial, sans-serif",
        fontSize: safeStyles.fontSize || "12pt",
        lineHeight: safeStyles.lineHeight || "1.4",
        wordBreak: "keep-all",
        hyphens: "manual",
        overflowWrap: "normal",
        whiteSpace: "normal",
        textRendering: "optimizeLegibility",
        WebkitFontFeatureSettings: '"liga" 1, "kern" 1',
        fontFeatureSettings: '"liga" 1, "kern" 1',
        paddingTop: "1rem"
      }}
      ref={containerRef}
    >
      <div
        className={`rounded-xl overflow-hidden relative bg-white ${isVisualAppealTemplate ? '' : 'shadow-lg border border-gray-200'}`}
        style={{
          fontFamily: safeStyles.fontFamily,
          background: mergedColors.background,
          color: mergedColors.text,
          padding: template && template.startsWith('ats_') ? "0" : (isVisualAppealTemplate ? "0" : "0.5rem")
        }}
      >








        {renderLayout()}

        {/* Sachet Strategy: Watermark for non-premium users */}
        {!isPremium && (
          <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden flex flex-col items-center justify-around opacity-[0.05] select-none">
            <div className="transform -rotate-12 text-6xl sm:text-8xl font-black tracking-widest whitespace-nowrap">
              RESUMEGYANI
            </div>
            <div className="transform -rotate-12 text-6xl sm:text-8xl font-black tracking-widest whitespace-nowrap">
              RESUMEGYANI
            </div>
            <div className="transform -rotate-12 text-6xl sm:text-8xl font-black tracking-widest whitespace-nowrap text-emerald-600">
              UPGRADE TO REMOVE
            </div>
            <div className="transform -rotate-12 text-6xl sm:text-8xl font-black tracking-widest whitespace-nowrap">
              RESUMEGYANI
            </div>
            <div className="transform -rotate-12 text-6xl sm:text-8xl font-black tracking-widest whitespace-nowrap">
              RESUMEGYANI
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ResumePreview;
