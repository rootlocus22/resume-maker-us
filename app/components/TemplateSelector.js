"use client";
import { useState, useEffect, useRef } from "react";
import { templates as allTemplates, getAllTemplateCategories } from "../lib/templates.js";
import { visualAppealTemplates } from "../lib/visualAppealTemplates.js";
import { premiumDesignTemplates } from "../lib/premiumDesignTemplates.js";
import { templateCategories } from "../lib/realTemplates.js";
import { ZoomIn, Lock, Check, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { event } from "../lib/gtag";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const TEMPLATE_PAYWALL = false;

const CATEGORY_META = {
  "Premium Design": {
    icon: "✨",
    activeBg: "bg-gradient-to-r from-violet-600 to-purple-600",
    description: "20 unique layouts inspired by top resume builders"
  },
  "Visual Appeal": {
    icon: "🎨",
    activeBg: "bg-gradient-to-r from-pink-500 to-rose-500",
    description: "Eye-catching designs with modern visual elements"
  },
  "ATS-Optimized": {
    icon: "🤖",
    activeBg: "bg-gradient-to-r from-green-600 to-emerald-600",
    description: "Optimized for Applicant Tracking Systems"
  },
  "Standard": {
    icon: "📄",
    activeBg: "bg-gradient-to-r from-blue-600 to-indigo-600",
    description: "Professional layouts for every industry"
  },
  "Job-Specific": {
    icon: "🎯",
    activeBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    description: "Tailored for specific roles and industries"
  },
};

const getFeatureTags = (config) => {
  const tags = [];
  if (config.layout?.columns === 2) tags.push("2-Col");
  else tags.push("1-Col");
  if (config.layout?.timelineStyle) tags.push("Timeline");
  if (config.layout?.showIcons) tags.push("Icons");
  return tags;
};

export default function TemplateSelector({
  template,
  setTemplate,
  onClose,
  disabled,
  isPremium,
  stayOnPage = false,
  onTemplateChange = () => {},
  hideJobSpecificTab = false,
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isLoadingZoom, setIsLoadingZoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageVersion, setImageVersion] = useState(3);
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Merge all templates excluding One-Pager
  const allMergedTemplates = { ...allTemplates, ...visualAppealTemplates, ...premiumDesignTemplates };
  const mergedTemplates = Object.entries(allMergedTemplates).reduce((acc, [key, config]) => {
    if (config.category !== 'One-Pager') acc[key] = config;
    return acc;
  }, {});

  useEffect(() => {
    setImageVersion(prev => prev + 1);
    const forceImageReload = () => {
      const images = document.querySelectorAll('img[src*="templates/previews"]');
      images.forEach((img, index) => {
        const originalSrc = img.src.split('?')[0];
        img.src = `${originalSrc}?v=${Date.now()}-${index}`;
      });
    };
    setTimeout(forceImageReload, 100);
  }, []);

  const getCategoryFromTemplate = (templateName) => {
    return mergedTemplates[templateName]?.category || "Standard";
  };

  const [templateState, setTemplateState] = useState(() => {
    const savedState = localStorage.getItem("lastTemplateState");
    const defaultState = { template: "visual_modern_executive", category: "Visual Appeal" };
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
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
        console.warn("Invalid template state:", e);
      }
    }
    const initialCategory = getCategoryFromTemplate(template);
    if (initialCategory === "One-Pager" || initialCategory === "One-Pager Templates") return defaultState;
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

  // Categories
  const baseCategories = getAllTemplateCategories();
  const allCategoriesFromTemplates = baseCategories.includes("Visual Appeal")
    ? baseCategories
    : [...baseCategories, "Visual Appeal"];

  const priorityOrder = ["Premium Design", "Visual Appeal", "ATS-Optimized", "Standard"];
  const categories = hideJobSpecificTab
    ? allCategoriesFromTemplates.filter(cat => cat !== "Job-Specific" && cat !== "One-Pager" && cat !== "One-Pager Templates")
    : allCategoriesFromTemplates.filter(cat => cat !== "One-Pager" && cat !== "One-Pager Templates");

  const sortedCategories = categories.sort((a, b) => {
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

  const validActiveCategory = categorizedTemplates[activeCategory]
    ? activeCategory
    : (sortedCategories[0] || "Visual Appeal");

  useEffect(() => {
    if (activeCategory !== validActiveCategory) {
      setTemplateState(prev => ({ ...prev, category: validActiveCategory }));
    }
  }, [activeCategory, validActiveCategory]);

  const filteredTemplates = categorizedTemplates[validActiveCategory] || [];

  // Tab scroll arrows
  const checkTabScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkTabScroll();
    const el = tabsRef.current;
    if (el) {
      el.addEventListener('scroll', checkTabScroll, { passive: true });
      window.addEventListener('resize', checkTabScroll);
      return () => {
        el.removeEventListener('scroll', checkTabScroll);
        window.removeEventListener('resize', checkTabScroll);
      };
    }
  }, [sortedCategories]);

  const scrollTabs = (dir) => {
    const el = tabsRef.current;
    if (el) el.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const handleSelect = async (key) => {
    const selectedTemplate = mergedTemplates[key];
    if (!selectedTemplate || !selectedTemplate.styles) {
      toast.error("Invalid template. Please try again.");
      return;
    }

    if (TEMPLATE_PAYWALL && selectedTemplate.premium && !isPremium) {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
          <Sparkles size={18} />
          <div>
            <p className="font-medium">Premium Template</p>
            <p className="text-sm opacity-90">Upgrade to unlock!</p>
          </div>
          <button onClick={() => { toast.dismiss(t.id); router.push("/pricing"); }} className="ml-4 px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium">Upgrade</button>
        </div>
      ));
      event({ action: "attempt_premium_template", category: "TemplateSelector", label: `Attempted ${selectedTemplate.name}` });
      return;
    }

    setIsLoading(true);
    try {
      if (stayOnPage) {
        setTemplate(key);
        onTemplateChange(key, selectedTemplate.defaultData);
        event({ action: "select_template", category: "TemplateSelector", label: `Selected ${selectedTemplate.name}` });
      } else {
        const url = selectedTemplate.category === "Job-Specific"
          ? `/job-specific-resume-builder?template=${key}`
          : `/resume-builder?template=${key}`;
        await router.push(url);
        event({ action: "select_template", category: "TemplateSelector", label: `Selected ${selectedTemplate.name}` });
      }
    } catch (error) {
      toast.error("Failed to switch template.");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const catMeta = CATEGORY_META[validActiveCategory] || CATEGORY_META["Standard"];

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-5xl h-full sm:h-[85vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden safe-area-inset">
        
        {/* ===== HEADER ===== */}
        <div className="flex-shrink-0 bg-white z-10 border-b border-gray-100">
          {/* Top bar — drag handle on mobile + title + close */}
          <div className="flex flex-col">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-3 sm:px-4 pt-1 sm:pt-3 pb-1.5 sm:pb-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Choose Template</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Category Tabs with scroll arrows */}
          <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollTabs(-1)}
                className="absolute left-0 top-0 bottom-0 z-10 w-7 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} className="text-gray-500" />
              </button>
            )}

            <div
              ref={tabsRef}
              className="flex gap-1.5 px-3 sm:px-4 pb-2 overflow-x-auto scrollbar-none scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {sortedCategories.map((category) => {
                const meta = CATEGORY_META[category] || CATEGORY_META["Standard"];
                const isActive = validActiveCategory === category;
                const count = categorizedTemplates[category]?.length || 0;
                return (
                  <button
                    key={category}
                    onClick={() => setTemplateState((prev) => ({ ...prev, category }))}
                    className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? `${meta.activeBg} text-white shadow-md`
                        : "bg-gray-100 text-gray-600 active:bg-gray-200"
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs">{meta.icon}</span>
                    <span>{category}</span>
                    <span className={`text-[10px] sm:text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollTabs(1)}
                className="absolute right-0 top-0 bottom-0 z-10 w-7 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Category description — hidden on mobile to save space */}
          {catMeta.description && (
            <div className="hidden sm:block px-4 pb-2">
              <p className="text-xs text-gray-500">{catMeta.description}</p>
            </div>
          )}
        </div>

        {/* ===== LOADING OVERLAY ===== */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-gray-500 font-medium">Applying...</span>
            </div>
          </div>
        )}

        {/* ===== TEMPLATE GRID ===== */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* 
            Mobile: 2-column compact grid  
            Tablet: 2-column  
            Desktop: 3-column  
          */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {filteredTemplates.map(([key, config]) => {
              const isSelected = localTemplate === key;
              const tags = getFeatureTags(config);
              return (
                <div
                  key={key}
                  className={`group relative rounded-lg sm:rounded-xl border transition-all duration-150 overflow-hidden ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-gray-200 active:border-blue-300 sm:hover:border-gray-300 sm:hover:shadow-lg"
                  } ${disabled || (config.premium && !isPremium) ? "opacity-70" : ""}`}
                  onClick={() => !disabled && !(config.premium && !isPremium) && handleSelect(key)}
                >
                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-blue-600 text-white p-0.5 sm:p-1 rounded-full shadow-md">
                      <Check size={10} className="sm:hidden" strokeWidth={3} />
                      <Check size={12} className="hidden sm:block" strokeWidth={3} />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-gray-50">
                    <img
                      key={`${config.previewImage}-${imageVersion}`}
                      src={`${config.previewImage}${config.previewImage.includes('?') ? '&' : '?'}v=${imageVersion}`}
                      alt={`${config.name}`}
                      className="w-full h-full object-cover object-top sm:transition-transform sm:duration-300 sm:group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(e) => { e.target.src = config.previewImage; }}
                    />

                    {/* Zoom button — always visible on mobile, hover on desktop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLoadingZoom(true);
                        setZoomedImage(`${config.previewImage}${config.previewImage.includes('?') ? '&' : '?'}v=${Date.now()}`);
                      }}
                      className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-white/80 sm:bg-white/90 backdrop-blur-sm text-gray-700 p-1 sm:p-1.5 rounded-md sm:rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-sm active:scale-90"
                      aria-label="Zoom preview"
                    >
                      <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                    {/* Premium lock */}
                    {TEMPLATE_PAYWALL && config.premium && !isPremium && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 text-white">
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                        <p className="text-[10px] sm:text-xs font-medium">Premium</p>
                      </div>
                    )}
                  </div>

                  {/* Card footer — compact on mobile */}
                  <div className="p-1.5 sm:p-3">
                    <h3 className="text-[11px] sm:text-sm font-semibold text-gray-800 truncate leading-tight">{config.name}</h3>

                    {/* Description — hidden on mobile */}
                    {config.description && (
                      <p className="hidden sm:block text-xs text-gray-500 mt-0.5 mb-1.5 line-clamp-1">{config.description}</p>
                    )}

                    {/* Feature tags — smaller on mobile */}
                    <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1 sm:mt-0 mb-1.5 sm:mb-2.5">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium bg-gray-100 text-gray-500 sm:text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    {!disabled && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(key); }}
                        disabled={isLoading || (config.premium && !isPremium)}
                        className={`w-full py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all active:scale-[0.97] ${
                          config.premium && !isPremium
                            ? "bg-gray-100 text-gray-400"
                            : isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-900 text-white active:bg-gray-700 sm:hover:bg-gray-800"
                        } ${isLoading && isSelected ? "animate-pulse" : ""}`}
                      >
                        {isLoading && isSelected ? (
                          "Applying..."
                        ) : isSelected ? (
                          <span className="flex items-center justify-center gap-0.5">
                            <Check size={10} /> Selected
                          </span>
                        ) : (
                          "Use Template"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

    {/* ===== ZOOMED IMAGE MODAL — rendered outside main modal for proper stacking ===== */}
    {zoomedImage && (
      <div
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-2 sm:p-4"
        onClick={() => setZoomedImage(null)}
      >
        <div className="relative w-full h-full max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {isLoadingZoom && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
            </div>
          )}
          <img
            src={zoomedImage}
            alt="Zoomed Preview"
            className="w-full h-full object-contain rounded-lg"
            onLoad={() => setIsLoadingZoom(false)}
            onError={() => {
              setIsLoadingZoom(false);
              setZoomedImage(null);
              toast.error("Failed to load preview.");
            }}
          />
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg active:scale-90 sm:hover:bg-gray-100 transition-all"
            aria-label="Close preview"
          >
            <X size={22} />
          </button>
        </div>
      </div>
    )}
    </>
  );
}
