"use client";
import { useState, useEffect } from "react";
import { templates as allTemplates, getAllTemplateCategories } from "../lib/templates.js";
import { visualAppealTemplates } from "../lib/visualAppealTemplates.js";
import { templateCategories } from "../lib/realTemplates.js";
import { ZoomIn, Lock, Check, Sparkles } from "lucide-react";
import { event } from "../lib/gtag";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const TEMPLATE_PAYWALL = false; // templates are free even if marked premium

export default function TemplateSelector({
  template,
  setTemplate,
  onClose,
  disabled,
  isPremium,
  stayOnPage = false,
  onTemplateChange = () => {},
  hideJobSpecificTab = false, // Add new prop with default value
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isLoadingZoom, setIsLoadingZoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageVersion, setImageVersion] = useState(3); // Force image reloading
  const router = useRouter();

  // Merge all templates including Visual Appeal, but exclude One-Pager templates
  const allMergedTemplates = { ...allTemplates, ...visualAppealTemplates };
  
  // Filter out One-Pager templates from the selector
  const mergedTemplates = Object.entries(allMergedTemplates).reduce((acc, [key, config]) => {
    if (config.category !== 'One-Pager') {
      acc[key] = config;
    }
    return acc;
  }, {});

  // Force image reloading when component mounts
  useEffect(() => {
    setImageVersion(prev => prev + 1);
    
    // Force reload all images by adding a timestamp
    const forceImageReload = () => {
      const images = document.querySelectorAll('img[src*="templates/previews"]');
      console.log('TemplateSelector: Found', images.length, 'template preview images to reload');
      images.forEach((img, index) => {
        const originalSrc = img.src.split('?')[0];
        const newSrc = `${originalSrc}?v=${Date.now()}-${index}`;
        console.log(`TemplateSelector: Reloading image ${index + 1}:`, originalSrc, '->', newSrc);
        img.src = newSrc;
      });
    };
    
    // Execute after a short delay to ensure DOM is ready
    setTimeout(forceImageReload, 100);
  }, []);

  const getCategoryFromTemplate = (templateName) => {
    return mergedTemplates[templateName]?.category || "Classic";
  };

  const [templateState, setTemplateState] = useState(() => {
    const savedState = localStorage.getItem("lastTemplateState");
    const defaultState = { template: "visual_modern_executive", category: "Visual Appeal" };
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Filter out One-Pager categories from saved state
        if (
          parsedState.template &&
          Object.keys(mergedTemplates).includes(parsedState.template) &&
          parsedState.category &&
          parsedState.category !== "One-Pager" &&
          parsedState.category !== "One-Pager Templates" &&
          getAllTemplateCategories().includes(parsedState.category)
        ) {
          return parsedState;
        }
      } catch (e) {
        console.warn("Invalid template state in localStorage, using defaults:", e);
      }
    }
    const initialCategory = getCategoryFromTemplate(template);
    // If initial category is a filtered one, use default
    if (initialCategory === "One-Pager" || initialCategory === "One-Pager Templates") {
      return defaultState;
    }
    return template ? { template, category: initialCategory } : defaultState;
  });

  const { template: localTemplate, category: activeCategory } = templateState;

  useEffect(() => {
    if (localTemplate !== template) {
      const newCategory = getCategoryFromTemplate(template);
      setTemplateState({ template, category: newCategory });
      localStorage.setItem("lastTemplateState", JSON.stringify({ template, category: newCategory }));
    }
  }, [template]);

  // Get all available categories from templates including Visual Appeal
  const baseCategories = getAllTemplateCategories();
  const allCategoriesFromTemplates = baseCategories.includes("Visual Appeal") 
    ? baseCategories 
    : [...baseCategories, "Visual Appeal"];
  
  // Filter categories based on hideJobSpecificTab prop and organize them
  // Also filter out One-Pager categories
  const priorityOrder = ["Visual Appeal", "Classic", "Professional", "Modern", "Creative", "Executive", "Minimal"];
  const categories = hideJobSpecificTab
    ? allCategoriesFromTemplates.filter(cat => cat !== "Job-Specific" && cat !== "One-Pager" && cat !== "One-Pager Templates")
    : allCategoriesFromTemplates.filter(cat => cat !== "One-Pager" && cat !== "One-Pager Templates");
  
  // Sort categories with priority order first, then alphabetically, but Job-Specific always last
  const sortedCategories = categories.sort((a, b) => {
    // Job-Specific always comes last
    if (a === "Job-Specific") return 1;
    if (b === "Job-Specific") return -1;
    
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  
  const categorizedTemplates = sortedCategories.reduce((acc, category) => {
    acc[category] = Object.entries(mergedTemplates).filter(([, config]) => config.category === category);
    return acc;
  }, {});

  // Ensure activeCategory exists in categorizedTemplates, otherwise use the first available category
  const validActiveCategory = categorizedTemplates[activeCategory] 
    ? activeCategory 
    : (sortedCategories[0] || "Visual Appeal");
  
  // Update state if activeCategory is invalid
  useEffect(() => {
    if (activeCategory !== validActiveCategory) {
      setTemplateState(prev => ({ ...prev, category: validActiveCategory }));
    }
  }, [activeCategory, validActiveCategory]);

  const handleSelect = async (key) => {
    const selectedTemplate = mergedTemplates[key];
    if (!selectedTemplate || !selectedTemplate.styles) {
      toast.error("Invalid template configuration. Please try again.");
      console.error(`Template ${key} is missing or invalid`);
      return;
    }

    if (TEMPLATE_PAYWALL && selectedTemplate.premium && !isPremium) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}
        >
          <Sparkles size={18} />
          <div>
            <p className="font-medium">Premium Template</p>
            <p className="text-sm opacity-90">Upgrade to unlock this template!</p>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/pricing");
            }}
            className="ml-4 px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-gray-100 transition"
          >
            Upgrade
          </button>
        </div>
      ));
      event({
        action: "attempt_premium_template",
        category: "TemplateSelector",
        label: `Attempted ${selectedTemplate.name}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (stayOnPage) {
        setTemplate(key);
        onTemplateChange(key, selectedTemplate.defaultData);
        event({
          action: "select_template",
          category: "TemplateSelector",
          label: `Selected ${selectedTemplate.name}`,
        });
      } else {
        const url =
          selectedTemplate.category === "Job-Specific"
            ? `/job-specific-resume-builder?template=${key}`
            : `/resume-builder?template=${key}`;
        await router.push(url);
        event({
          action: "select_template",
          category: "TemplateSelector",
          label: `Selected ${selectedTemplate.name}`,
        });
      }
    } catch (error) {
      console.error("Navigation failed:", error);
      toast.error("Failed to switch template. Please try again.");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">Choose a Template</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close template selector"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300">
            {sortedCategories.map((category) => (
              <button
                key={category}
                onClick={() => setTemplateState((prev) => ({ ...prev, category }))}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }`}
              >
                {category} <span className="text-xs opacity-75">({categorizedTemplates[category]?.length || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center z-50 rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(categorizedTemplates[validActiveCategory] || []).map(([key, config]) => (
            <div
              key={key}
              className={`relative group p-4 border rounded-xl transition-all ${
                localTemplate === key
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              } ${disabled || (config.premium && !isPremium) ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {localTemplate === key && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full z-10">
                  <Check size={16} />
                </div>
              )}

              {/* Template Thumbnail - Responsive height */}
              <div className="relative flex-shrink-0 w-full aspect-[4/5] mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  key={`${config.previewImage}-${imageVersion}`}
                  src={`${config.previewImage}${config.previewImage.includes('?') ? '&' : '?'}v=${imageVersion}`}
                  alt={`${config.name} Preview`}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'top center' }}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to original image if cache-busted version fails
                    e.target.src = config.previewImage;
                  }}
                />
                {TEMPLATE_PAYWALL && config.premium && !isPremium && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 rounded-lg text-white p-4 text-center">
                    <Lock className="h-6 w-6 mb-2" />
                    <p className="font-medium">Premium Template</p>
                    <p className="text-xs opacity-80 mt-1">Upgrade to unlock</p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoadingZoom(true);
                    // Force reload the zoomed image with cache busting
                    const cacheBustedImage = `${config.previewImage}${config.previewImage.includes('?') ? '&' : '?'}v=${Date.now()}`;
                    console.log('TemplateSelector: Zooming image with cache busting:', cacheBustedImage);
                    setZoomedImage(cacheBustedImage);
                  }}
                  className="absolute top-2 right-2 bg-white/90 text-gray-600 p-2 rounded-full hover:bg-white hover:text-blue-600 transition-all shadow-sm"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Template Details */}
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{config.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {config.layout.columns}-Column • {config.layout.showIcons ? "With Icons" : "No Icons"}
                    </p>
                  </div>
                  {TEMPLATE_PAYWALL && config.premium && (
                    <span
                      className={`relative text-xs px-2 py-1 rounded-full ${isPremium ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800 animate-pulse'} `}
                    >
                      {isPremium ? 'Unlocked' : 'Premium'}
                      {!isPremium && (
                        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-sm animate-ping"></span>
                      )}
                    </span>
                  )}
                </div>

                {!disabled && (
                  <button
                    onClick={() => handleSelect(key)}
                    disabled={isLoading || (config.premium && !isPremium)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      config.premium && !isPremium
                        ? "bg-gray-100 text-gray-400"
                        : localTemplate === key
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } ${isLoading && localTemplate === key ? "animate-pulse" : ""}`}
                  >
                    {isLoading && localTemplate === key ? (
                      "Applying..."
                    ) : localTemplate === key ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check size={16} /> Selected
                      </span>
                    ) : (
                      "Use This Template"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Zoomed Image Modal */}
        {zoomedImage && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setZoomedImage(null)}
          >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              {isLoadingZoom && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                </div>
              )}
              <img
                src={zoomedImage}
                alt="Zoomed Template Preview"
                className="w-full h-full object-contain rounded-md"
                onLoad={() => setIsLoadingZoom(false)}
                onError={() => {
                  setIsLoadingZoom(false);
                  setZoomedImage(null);
                  toast.error("Failed to load image.");
                }}
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-2 right-2 bg-gray-800/80 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
                aria-label="Close zoomed preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}