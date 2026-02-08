"use client";
import { useState, useTransition, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, User, FileText, Share2, LogOut, Home, BookOpen, HelpCircle, Info, Mail, ChevronDown, UploadCloud, CheckCircle, Sparkles, Settings, Crown, Bot, Trophy, Zap, Gift, DollarSign, Wallet, Briefcase, BookmarkCheck, Building2, FileEdit, Mic, Target, TrendingUp, Users, Brain, Lightbulb, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { event } from "../lib/gtag";

export default function Header() {
  const { user, plan, isPremium, handleLogout, interviewPlan, isInterviewPremium } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState(null);
  const [megaMenuAnchor, setMegaMenuAnchor] = useState(null);
  const [resourcesAnchor, setResourcesAnchor] = useState(null);
  const [otherAnchor, setOtherAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();



  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Check if user has access to advanced features (JD Builder, Salary Analyzer, AI Interview)
  const hasAdvancedAccess = plan === "premium" || plan === "monthly" || plan === "quarterly" || plan === "sixMonth";

  // Generate tiered premium badge based on user plan
  const getPremiumBadges = () => {
    const badges = [];

    // 1. Resume Plan Badge
    if (plan && plan !== 'free' && plan !== 'anonymous') {
      if (plan === 'oneDay' || plan === 'basic') {
        badges.push({
          text: 'Starter (Trial)',
          icon: <Zap size={14} className="text-primary" />,
          gradient: 'from-primary to-accent',
          bgGradient: 'from-primary-50 to-accent-50',
          textColor: 'text-primary',
          borderColor: 'border-primary-200',
          shadow: 'shadow-md',
          pulse: true,
          level: 'starter'
        });
      } else if (plan === 'monthly') {
        badges.push({
          text: 'Pro Member',
          icon: <Star size={14} className="text-emerald-500" />,
          gradient: 'from-emerald-400 to-teal-500',
          bgGradient: 'from-emerald-50 to-teal-100',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          shadow: 'shadow-lg',
          pulse: true,
          level: 'pro'
        });
      } else if (plan === 'quarterly') {
        badges.push({
          text: 'Expert Member',
          icon: <Crown size={14} className="text-amber-500" />,
          gradient: 'from-amber-400 to-orange-500',
          bgGradient: 'from-amber-50 to-orange-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          shadow: 'shadow-lg',
          pulse: true,
          level: 'expert'
        });
      } else if (plan === 'premium' || plan === 'sixMonth') {
        badges.push({
          text: 'Ultimate Elite',
          icon: <Trophy size={14} className="text-purple-500" />,
          gradient: 'from-primary via-accent/80 to-primary-600',
          bgGradient: 'from-primary-50 via-accent-50/50 to-primary-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          shadow: 'shadow-xl',
          pulse: true,
          level: 'ultimate'
        });
      }
    }

    // 2. Interview Plan Badge logic removed as requested


    // Fallback if no plans
    if (badges.length === 0) {
      badges.push({
        text: 'Free User',
        icon: <Trophy size={14} className="text-gray-400" />,
        gradient: 'from-gray-400 to-gray-500',
        bgGradient: 'from-gray-50 to-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200',
        shadow: 'shadow-sm',
        pulse: false,
        level: 'basic'
      });
    }

    return badges;
  };

  const primaryBadges = getPremiumBadges();
  // For single-badge UI spots, use the first/most important one
  const primaryBadge = primaryBadges[0];

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const userDropdownRef = useRef(null);
  const closeMenuTimeoutRef = useRef(null);

  const HEADER_HEIGHT = 64; // 4rem - single bar, logo fits inside
  const MOBILE_HEADER_HEIGHT = 56;

  // New Grouped Mega Menu Structure
  const megaMenuGroups = {
    resumeTools: {
      label: "Resume Tools",
      icon: FileText,
      items: [
        {
          href: "/resume-builder",
          label: "Resume Builder",
          icon: FileText,
          description: "Build professional resumes in minutes",
          badgeText: "Popular",
          badgeColor: "bg-primary-500"
        },
        {
          href: "/upload-resume",
          label: "Upload & Enhance",
          icon: UploadCloud,
          description: "Improve your existing resume",
          badgeText: "Free",
          badgeColor: "bg-green-500"
        },
        {
          href: "/ats-score-checker",
          label: "ATS Score Checker",
          icon: CheckCircle,
          description: "Check resume compatibility",
          badgeText: "Free",
          badgeColor: "bg-green-500"
        },
        {
          href: "/free-ai-resume-builder",
          label: "Text to Resume",
          icon: Sparkles,
          description: "Convert text to valid resume instantly",
          badgeText: "New",
          badgeColor: "bg-gradient-to-r from-primary to-accent"
        },
        {
          href: "/job-description-resume-builder",
          label: "JD Resume Builder",
          icon: Bot,
          description: "Tailor resume to job descriptions",
          badgeText: "Pro",
          badgeColor: "bg-purple-500",
          premiumOnly: true
        },
        {
          href: "/interview-prep-kit",
          label: "Interview Prep Kit",
          icon: Brain,
          description: "20 questions with winning answers",
          badgeText: "New",
          badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-500"
        },
        {
          href: "/resume-examples",
          label: "Resume Examples",
          icon: BookOpen,
          description: "Browse 30+ job-specific examples",
          badgeText: "New",
          badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500"
        },
        {
          href: "/cover-letter-builder",
          label: "Cover Letter Builder",
          icon: FileEdit,
          description: "Create compelling cover letters"
        },
        {
          href: "/one-pager-builder",
          label: "One-Pager Resume",
          icon: FileText,
          description: "Single-page resume format"
        },
      ]
    },
    jobSearch: {
      label: "Job Search",
      icon: Briefcase,
      items: [
        {
          href: "/jobs-nearby",
          label: "Find Jobs",
          icon: Target,
          description: "AI-powered job matching",
          badgeText: "New",
          badgeColor: "bg-emerald-500",
          requiresAuth: true,
          onClick: (e) => {
            if (!user) {
              e.preventDefault();
              router.push("/login");
              toast("Please sign in to find jobs!");
            }
          }
        },
        {
          href: "/my-jobs",
          label: "My Jobs",
          icon: BookmarkCheck,
          description: "Track your applications",
          badgeText: "Premium",
          badgeColor: "bg-primary-500",
          requiresAuth: true,
          onClick: (e) => {
            if (!user) {
              e.preventDefault();
              router.push("/login");
              toast("Please sign in to track jobs!");
            }
          }
        },
      ]
    },
    careerTools: {
      label: "Career Tools",
      icon: TrendingUp,
      items: [
        {
          href: "/ai-interview",
          label: "Interview Simulation",
          icon: Mic,
          description: "Practice with AI mock interviews",
          badgeText: "New",
          badgeColor: "bg-primary-500",
          onClick: (e) => {
            e.preventDefault();
            router.push("/ai-interview");
          }
        },
        {
          href: "/salary-analyzer",
          label: "Salary Analyzer",
          icon: DollarSign,
          description: "Know your market worth",
          badgeText: "Pro",
          badgeColor: "bg-purple-500",
          requiresProPlan: true
        },
        {
          href: "/expertresume-chat",
          label: "ExpertResume GPT",
          icon: Bot,
          description: "AI career assistant",
          badgeText: "AI",
          badgeColor: "bg-primary-500",
          requiresAuth: true,
          onClick: (e) => {
            if (!user) {
              e.preventDefault();
              router.push("/login");
              toast("Please sign in to chat with ExpertResume!");
            }
          }
        },
        {
          href: "/feature-requests",
          label: "Feature Requests",
          icon: Lightbulb,
          description: "Vote for features you want",
          badgeText: "New",
          badgeColor: "bg-yellow-500",
          requiresAuth: true,
          onClick: (e) => {
            if (!user) {
              e.preventDefault();
              router.push("/login");
              toast("Please sign in to suggest features!");
            }
          }
        },
      ]
    }
  };

  // Simple top-level menu items
  const topLevelItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      onClick: (e) => {
        if (user) {
          e.preventDefault();
          router.push("/dashboard");
        }
        event({ action: "nav_home", category: "Navigation", label: user ? "LoggedIn" : "LoggedOut" });
      }
    },
  ];

  // Resources menu items
  const resourcesMenuItems = [
    { href: "/templates", label: "Templates", icon: FileText },
    { href: "/features", label: "Features", icon: Sparkles },
    { href: "/faqs", label: "FAQs", icon: HelpCircle },
    { href: "/about-us", label: "About Us", icon: Info },
    { href: "/contact-us", label: "Contact", icon: Mail },
  ];

  // Other menu items (Pricing, Enterprise, Refer & Earn, Share Feedback)
  const otherMenuItems = [
    {
      href: user ? "/checkout?billingCycle=quarterly&step=1" : "/pricing",
      label: "Pricing",
      icon: Crown,
      description: "View our plans and pricing"
    },
    {
      href: "/refer-and-earn",
      label: "Refer & Earn",
      icon: Gift,
      description: "Earn rewards by referring friends",
      badgeText: "🎁 Rewards",
      badgeColor: "bg-gradient-to-r from-primary to-accent",
      requiresAuth: true,
      onClick: (e) => {
        if (!user) {
          e.preventDefault();
          router.push("/login");
          toast("Please sign in to access Refer & Earn!");
        }
      }
    },
    {
      href: "/enterprise",
      label: "Enterprise",
      icon: Building2,
      description: "Solutions for businesses & teams",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      href: "/share-feedback",
      label: "Share Feedback",
      icon: MessageSquare,
      description: "Help us improve by sharing your feedback"
    }
  ];

  // Special menu items (for mobile/legacy)
  const specialMenuItems = [];

  // Legacy menu items structure for mobile
  const criticalMenuItems = [
    ...topLevelItems,
    ...Object.values(megaMenuGroups).flatMap(group => group.items),
    ...otherMenuItems
  ];

  const nonCriticalMenuItems = resourcesMenuItems;

  const loggedInMenuItems = [
    { href: "/edit-profile", label: "Profile", icon: User, premiumOnly: false },
    { href: "/account", label: "Account", icon: Settings, premiumOnly: false },
    { href: "/dashboard", label: "Dashboard", icon: FileText, premiumOnly: false },
    { href: "/refer-and-earn", label: "Refer & Earn", icon: Gift, premiumOnly: false },
  ];

  const handleLogoutClick = useCallback(async () => {
    try {
      const redirectPath = await handleLogout();
      setIsUserMenuOpen(false);
      setUserMenuAnchor(null);
      setUserMenuAnchorEl(null);
      setIsMenuOpen(false);
      event({ action: "user_logout", category: "Authentication", label: "Logout" });
      if (redirectPath) {
        startTransition(() => router.push(redirectPath));
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  }, [handleLogout, router]);


  // Memoize avatar computation
  const avatar = useMemo(() => {
    if (!user) return null;
    const name = user.displayName || user.email?.split("@")[0] || "U";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white font-medium shadow-md ring-1 ring-primary-200/50 hover:ring-primary-300/50 transition-all duration-200">
        {initials}
      </div>
    );
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu if clicking outside
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !userMenuButtonRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      // Close user menu if clicking outside
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !userMenuButtonRef.current?.contains(event.target) &&
        !userDropdownRef.current?.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
        setUserMenuAnchor(null);
        setUserMenuAnchorEl(null);
      }

      // Don't close mega menu on click - let hover and explicit click handlers manage it
      // The mega menu now uses hover states for better UX
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (closeMenuTimeoutRef.current) {
        clearTimeout(closeMenuTimeoutRef.current);
      }
    };
  }, []);

  const scheduleMenuClose = useCallback(() => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
    closeMenuTimeoutRef.current = setTimeout(() => {
      setOpenMegaMenu(null);
      setMegaMenuAnchor(null);
      setResourcesAnchor(null);
      setOtherAnchor(null);
    }, 100);
  }, []);

  const cancelMenuClose = useCallback(() => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
  }, []);

  const getMenuStyle = useCallback((rect, width, align = "left") => {
    if (!mounted) return null;
    if (!rect || !Number.isFinite(width)) {
      return {
        position: "fixed",
        top: HEADER_HEIGHT,
        right: 12,
        width
      };
    }
    const viewportWidth = window.innerWidth || 0;
    let left = align === "right" ? rect.right - width : rect.left;
    if (!Number.isFinite(left)) {
      return {
        position: "fixed",
        top: Math.round(rect.bottom),
        right: 12,
        width
      };
    }
    const maxLeft = Math.max(8, viewportWidth - width - 8);
    left = Math.min(Math.max(8, left), maxLeft);
    return {
      position: "fixed",
      top: Math.round(rect.bottom),
      left: Math.round(left),
      width
    };
  }, [mounted]);

  useLayoutEffect(() => {
    if (!mounted || !isUserMenuOpen || !userMenuAnchorEl) return;
    const updateAnchor = () => {
      const rect = userMenuAnchorEl.getBoundingClientRect();
      if (rect) {
        setUserMenuAnchor({ rect });
      }
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [mounted, isUserMenuOpen, userMenuAnchorEl]);

  if (isPending) {
    return (
      <header
        className="app-header bg-white shadow-sm sticky top-0 z-20 border-b border-slate-200"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="max-w-8xl mx-auto pl-0 pr-4 sm:pl-0 sm:pr-6 lg:pl-0 lg:pr-8 h-full flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  // Hide Header on ExpertResume Chat page for immersive experience (return null AFTER all hooks)
  if (pathname === '/expertresume-chat') return null;

  return (
    <>
      <header
        className="app-header bg-white shadow-sm sticky top-0 z-20 border-b border-slate-200"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full h-full">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center h-full shrink-0 min-w-0 pl-2 pr-2 hover:opacity-90 transition-opacity duration-200"
              onClick={() => {
                setIsMenuOpen(false);
                event({ action: "nav_logo", category: "Navigation", label: user ? "LoggedIn" : "LoggedOut" });
              }}
            >
              <img
                src="/ExpertResume.png"
                alt="ExpertResume - Resume to Job Offer Career Platform"
                width={180}
                height={48}
                fetchPriority="high"
                className="h-10 w-auto max-h-[48px] object-contain object-left"
                decoding="async"
              />
            </Link>

            <nav className="flex-1 flex justify-center items-center h-full mx-2">
              <div className="flex items-center space-x-1 h-full">
                {/* Top Level Items */}
                {topLevelItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-full flex items-center px-3 text-[#0B1F3B] hover:text-teal-600 font-medium text-sm transition-colors duration-200 ${pathname === item.href ? "text-teal-600 border-b-2 border-teal-500" : ""
                      }`}
                    onClick={item.onClick || (() => event({ action: `nav_${item.label.toLowerCase().replace(/ /g, "_")}`, category: "Navigation", label: "Header" }))}
                  >
                    <item.icon size={16} className="mr-1.5" />
                    {item.label}
                  </Link>
                ))}

                {/* Mega Menu Items */}
                {Object.entries(megaMenuGroups).map(([key, group]) => {
                  // Filter items based on plan and auth
                  const visibleItems = group.items.filter(item => {
                    if (item.requiresAuth && !user) return false;
                    if (item.requiresProPlan && !hasAdvancedAccess) return false;

                    // US product: hide India/Naukri-specific routes
                    const indiaSpecific = ['/resume-builder-government-jobs-india', '/jobs-in-india', '/compare/naukri-ats-score'];
                    if (indiaSpecific.includes(item.href)) return false;

                    return true;
                  });

                  if (visibleItems.length === 0) return null;

                  return (
                    <div
                      key={key}
                      className="relative h-full flex items-center"
                      onMouseEnter={(e) => {
                        cancelMenuClose();
                        setOpenMegaMenu(key);
                        setMegaMenuAnchor({ key, rect: e.currentTarget.getBoundingClientRect() });
                      }}
                      onMouseLeave={scheduleMenuClose}
                    >
                      <button
                        className={`h-full flex items-center px-3 text-[#0B1F3B] hover:text-teal-600 font-medium text-sm transition-colors duration-200 ${openMegaMenu === key ? "text-teal-600" : ""
                          }`}
                      >
                        <group.icon size={16} className="mr-1.5" />
                        {group.label}
                        <ChevronDown size={14} className="ml-1" />
                      </button>

                      {/* Mega Menu Dropdown */}
                      {mounted && openMegaMenu === key && megaMenuAnchor?.key === key && createPortal(
                        <div
                          style={getMenuStyle(megaMenuAnchor?.rect, 320, "left")}
                          className="bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] py-2"
                          onMouseEnter={cancelMenuClose}
                          onMouseLeave={scheduleMenuClose}
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                              <group.icon size={18} className="text-primary" />
                              <span>{group.label}</span>
                            </div>
                          </div>
                          <div className="py-1">
                            {visibleItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                target={item.target || undefined}
                                rel={item.rel || undefined}
                                className={`block px-4 py-3 hover:bg-primary-50 transition-colors duration-200 group ${pathname === item.href ? "bg-primary-50" : ""
                                  }`}
                                onClick={(e) => {
                                  if (item.onClick) {
                                    item.onClick(e);
                                    if (e.defaultPrevented) {
                                      setOpenMegaMenu(null);
                                      return;
                                    }
                                  }
                                  setOpenMegaMenu(null);
                                  setMegaMenuAnchor(null);
                                  event({ action: `nav_${item.label.toLowerCase().replace(/ /g, "_")}`, category: "Navigation", label: "MegaMenu" });
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 p-2 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'} group-hover:bg-primary-100 transition-colors`}>
                                    <item.icon size={18} className={`${pathname === item.href ? 'text-primary' : 'text-gray-600'} group-hover:text-primary`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-medium ${pathname === item.href ? 'text-primary' : 'text-gray-900'} group-hover:text-primary`}>
                                        {item.label}
                                      </span>
                                      {item.badgeText && (
                                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                          {item.badgeText}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                  );
                })}

                {/* Resources Dropdown - Hidden on smaller screens */}
                <div
                  className="relative h-full items-center hidden xl:flex"
                  onMouseEnter={(e) => {
                    cancelMenuClose();
                    setOpenMegaMenu('resources');
                    setResourcesAnchor({ rect: e.currentTarget.getBoundingClientRect() });
                  }}
                  onMouseLeave={scheduleMenuClose}
                >
                  <button
                    className={`h-full flex items-center px-3 text-[#0B1F3B] hover:text-teal-600 font-medium text-sm transition-colors duration-200 ${openMegaMenu === 'resources' ? "text-teal-600" : ""
                      }`}
                  >
                    <BookOpen size={16} className="mr-1.5" />
                    Resources
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {mounted && openMegaMenu === 'resources' && createPortal(
                    <div
                      style={getMenuStyle(resourcesAnchor?.rect, 224, "right")}
                      className="bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] py-1"
                      onMouseEnter={cancelMenuClose}
                      onMouseLeave={scheduleMenuClose}
                    >
                      {resourcesMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 flex items-center gap-3 ${pathname === item.href ? "text-primary bg-primary-50" : ""
                            }`}
                          onClick={() => {
                            setOpenMegaMenu(null);
                            setResourcesAnchor(null);
                            event({ action: `nav_${item.label.toLowerCase().replace(/ /g, "_")}`, category: "Navigation", label: "Resources" });
                          }}
                        >
                          <item.icon size={16} />
                          {item.label}
                        </Link>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>

                {/* Other Dropdown - Hidden on smaller screens */}
                <div
                  className="relative h-full items-center hidden xl:flex"
                  onMouseEnter={(e) => {
                    cancelMenuClose();
                    setOpenMegaMenu('other');
                    setOtherAnchor({ rect: e.currentTarget.getBoundingClientRect() });
                  }}
                  onMouseLeave={scheduleMenuClose}
                >
                  <button
                    className={`h-full flex items-center px-3 text-[#0B1F3B] hover:text-teal-600 font-medium text-sm transition-colors duration-200 ${openMegaMenu === 'other' ? "text-teal-600" : ""
                      }`}
                  >
                    <Settings size={16} className="mr-1.5" />
                    Other
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {mounted && openMegaMenu === 'other' && createPortal(
                    <div
                      style={getMenuStyle(otherAnchor?.rect, 320, "right")}
                      className="bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] py-2"
                      onMouseEnter={cancelMenuClose}
                      onMouseLeave={scheduleMenuClose}
                    >
                      <div className="py-1">
                        {otherMenuItems.map((item) => {
                          if (item.requiresAuth && !user) return null;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              target={item.target || undefined}
                              rel={item.rel || undefined}
                              className={`block px-4 py-3 hover:bg-primary-50 transition-colors duration-200 group ${pathname === item.href ? "bg-primary-50" : ""
                                }`}
                              onClick={(e) => {
                                if (item.onClick) {
                                  item.onClick(e);
                                  if (e.defaultPrevented) {
                                    setOpenMegaMenu(null);
                                    return;
                                  }
                                }
                                setOpenMegaMenu(null);
                                setOtherAnchor(null);
                                event({ action: `nav_${item.label.toLowerCase().replace(/ /g, "_")}`, category: "Navigation", label: "Other" });
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 p-2 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'} group-hover:bg-primary-100 transition-colors`}>
                                  <item.icon size={18} className={`${pathname === item.href ? 'text-primary' : 'text-gray-600'} group-hover:text-primary`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-medium ${pathname === item.href ? 'text-primary' : 'text-gray-900'} group-hover:text-primary`}>
                                      {item.label}
                                    </span>
                                    {item.badgeText && (
                                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                        {item.badgeText}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 group-hover:text-gray-600">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-3 h-full">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/918431256903?text=${encodeURIComponent("Hi ExpertResume Team! 👋\n\nI'm visiting your website and would like assistance with:\n• Resume Building & Optimization\n• ATS Score Improvement\n• Career Guidance & Job Search\n• Premium Features & Plans\n• Technical Support\n\nPlease help me get started. Thank you!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                title="Contact us on WhatsApp"
                onClick={() => event({ action: "whatsapp_click", category: "Contact", label: "Header" })}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden lg:inline text-sm font-medium">WhatsApp</span>
              </a>
              {user && (
                <div className="relative h-full flex items-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 ${primaryBadge.borderColor} bg-gradient-to-r ${primaryBadge.bgGradient} ${primaryBadge.shadow} ${primaryBadge.pulse ? 'animate-pulse' : ''} transition-all duration-300 hover:scale-105`}>
                    <div className={`${primaryBadge.pulse ? 'animate-bounce' : ''}`}>
                      {primaryBadge.icon}
                    </div>
                    <span className={`text-xs font-bold ${primaryBadge.textColor} tracking-wide`}>
                      {primaryBadge.text}
                    </span>
                    {primaryBadge.level === 'premium' && (
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              )}
              <div className="relative h-full flex items-center" ref={userMenuRef}>
                {user ? (
                  <div className="relative">
                    <button
                      ref={userMenuButtonRef}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const anchorEl = e.currentTarget;
                        const rect = anchorEl?.getBoundingClientRect?.();
                        setIsUserMenuOpen(prev => {
                          const nextOpen = !prev;
                          if (nextOpen) {
                            setUserMenuAnchorEl(anchorEl || null);
                            setUserMenuAnchor(rect ? { rect } : null);
                          } else {
                            setUserMenuAnchor(null);
                            setUserMenuAnchorEl(null);
                          }
                          return nextOpen;
                        });
                      }}
                      className="flex items-center gap-2 px-3 h-full focus:outline-none hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      type="button"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                    >
                      {avatar}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 h-full">
                    <Link href="/resume-builder" className="hidden lg:flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200 mr-2 hover:bg-green-100 transition-colors cursor-pointer">
                      <CheckCircle className="text-green-600" size={12} />
                      <span className="text-[10px] font-bold text-green-700">Build for Free</span>
                    </Link>
                    <Link
                      href="/login"
                      className="px-3 py-1.5 text-gray-700 hover:text-primary font-medium text-sm transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-1.5 bg-gradient-to-br from-primary to-primary-600 text-white font-medium text-sm rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                {mounted && isUserMenuOpen && user && createPortal(
                  <div
                    ref={userDropdownRef}
                    style={getMenuStyle(userMenuAnchor?.rect, 224, "right") || { right: 12, top: HEADER_HEIGHT }}
                    className="bg-white rounded-md shadow-lg border border-gray-200 z-[10000] py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {user && (
                      <div className={`px-3 py-2 ${primaryBadge.bgGradient} ${primaryBadge.textColor} text-xs font-semibold flex items-center gap-2 border-b ${primaryBadge.borderColor}`}>
                        {primaryBadge.icon} {primaryBadge.text}
                      </div>
                    )}
                    {loggedInMenuItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setUserMenuAnchor(null);
                          setUserMenuAnchorEl(null);
                          event({ action: `nav_${item.label.toLowerCase().replace(" ", "_")}`, category: "Navigation", label: "DesktopUserMenu" });
                          startTransition(() => router.push(item.href));
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                      >
                        <item.icon size={14} /> {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogoutClick();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>,
                  document.body
                )}
              </div>

            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full h-full">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center shrink-0 h-full hover:opacity-90 transition-opacity duration-200"
              onClick={() => {
                setIsMenuOpen(false);
                event({ action: "nav_logo", category: "Navigation", label: user ? "LoggedIn" : "LoggedOut" });
              }}
            >
              <img
                src="/ExpertResume.png"
                alt="ExpertResume - Resume to Job Offer Career Platform"
                width={160}
                height={44}
                fetchPriority="high"
                className="h-10 w-auto max-h-[44px] object-contain"
                decoding="async"
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* WhatsApp Button - Mobile */}
              <a
                href={`https://wa.me/918431256903?text=${encodeURIComponent("Hi ExpertResume Team! 👋\n\nI'm visiting your website and would like assistance with:\n• Resume Building & Optimization\n• ATS Score Improvement\n• Career Guidance & Job Search\n• Premium Features & Plans\n• Technical Support\n\nPlease help me get started. Thank you!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors duration-200 shadow-md"
                title="Contact us on WhatsApp"
                onClick={() => event({ action: "whatsapp_click", category: "Contact", label: "HeaderMobile" })}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              {user && (
                <div className="relative h-full flex items-center">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${primaryBadge.borderColor} bg-gradient-to-r ${primaryBadge.bgGradient} ${primaryBadge.shadow} ${primaryBadge.pulse ? 'animate-pulse' : ''} transition-all duration-300`}>
                    <div className={`${primaryBadge.pulse ? 'animate-bounce' : ''}`}>
                      {primaryBadge.icon}
                    </div>
                    <span className={`text-[9px] font-bold ${primaryBadge.textColor} tracking-wide`}>
                      {primaryBadge.text}
                    </span>
                    {primaryBadge.level === 'premium' && (
                      <div className="w-1 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              )}
              <div className="relative h-full flex items-center" ref={userMenuRef}>
                {user ? (
                  <div className="relative">
                    <button
                      ref={userMenuButtonRef}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const anchorEl = e.currentTarget;
                        const rect = anchorEl?.getBoundingClientRect?.();
                        setIsUserMenuOpen(prev => {
                          const nextOpen = !prev;
                          if (nextOpen) {
                            setUserMenuAnchorEl(anchorEl || null);
                            setUserMenuAnchor(rect ? { rect } : null);
                          } else {
                            setUserMenuAnchor(null);
                            setUserMenuAnchorEl(null);
                          }
                          return nextOpen;
                        });
                      }}
                      className="flex items-center justify-center w-9 h-9 focus:outline-none hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      type="button"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                    >
                      {avatar}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-gray-700 hover:text-primary font-medium text-sm transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                )}
                {mounted && isUserMenuOpen && user && createPortal(
                  <div
                    ref={userDropdownRef}
                    style={getMenuStyle(userMenuAnchor?.rect, 224, "right") || { right: 12, top: HEADER_HEIGHT }}
                    className="bg-white rounded-md shadow-lg border border-gray-200 z-[10000] py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {user && (
                      <div className={`px-3 py-2 ${primaryBadge.bgGradient} ${primaryBadge.textColor} text-xs font-semibold flex items-center gap-2 border-b ${primaryBadge.borderColor}`}>
                        {primaryBadge.icon} {primaryBadge.text}
                      </div>
                    )}
                    {loggedInMenuItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setUserMenuAnchor(null);
                          setUserMenuAnchorEl(null);
                          event({ action: `nav_${item.label.toLowerCase().replace(" ", "_")}`, category: "Navigation", label: "MobileUserMenu" });
                          startTransition(() => router.push(item.href));
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                      >
                        <item.icon size={14} /> {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogoutClick();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>,
                  document.body
                )}
              </div>


              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-primary-50 hover:text-primary transition-all duration-200 rounded-lg active:scale-95"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Rendered outside header for proper layering */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            ref={menuRef}
            className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl overflow-hidden flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-5 flex-shrink-0">
              {user ? (
                /* Logged In - User Card at Top */
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-white/80 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  {isPremium && (
                    <div className="mt-2 flex items-center gap-1.5 bg-yellow-400/20 text-yellow-100 px-2 py-1 rounded text-xs font-medium">
                      <Crown size={12} />
                      <span>Premium Member</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged Out - Logo Only */
                <div className="flex items-center justify-center">
                  <img
                    src="/ExpertResume.png"
                    alt="ExpertResume"
                    width={140}
                    height={40}
                    className="h-10 w-auto max-h-[40px] object-contain"
                    decoding="async"
                  />
                </div>
              )}
            </div>

            {/* Scrollable Menu Content */}
            <nav className="flex-1 overflow-y-auto p-4 pb-8">
              {/* Top Level Items */}
              {topLevelItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2 ${pathname === item.href
                    ? "bg-primary-50 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                  onClick={(e) => {
                    if (item.onClick) item.onClick(e);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="font-medium flex-1 truncate">{item.label}</span>
                </Link>
              ))}

              {/* Resume Tools Section */}
              <div className="mt-6 mb-2">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                  <FileText size={14} />
                  <span>Resume Tools</span>
                </div>
                {megaMenuGroups.resumeTools.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${pathname === item.href
                      ? "bg-primary-50 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={(e) => {
                      if (item.onClick) item.onClick(e);
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <item.icon size={16} className={pathname === item.href ? 'text-primary' : 'text-gray-600'} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.badgeText && (
                      <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full ${item.badgeColor}`}>
                        {item.badgeText}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Job Search Section */}
              <div className="mt-6 mb-2">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                  <Briefcase size={14} />
                  <span>Job Search ({megaMenuGroups.jobSearch?.items?.length || 0})</span>
                </div>
                {megaMenuGroups.jobSearch?.items && megaMenuGroups.jobSearch.items.length > 0 ? (
                  megaMenuGroups.jobSearch.items.map((item, index) => (
                    <Link
                      key={item.href || index}
                      href={item.href}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${pathname === item.href
                        ? "bg-primary-50 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={(e) => {
                        if (item.onClick) item.onClick(e);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'}`}>
                          <item.icon size={16} className={pathname === item.href ? 'text-primary' : 'text-gray-600'} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.badgeText && (
                        <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full ${item.badgeColor}`}>
                          {item.badgeText}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-gray-500">No items available</div>
                )}
              </div>

              {/* Career Tools Section */}
              <div className="mt-6 mb-2">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <TrendingUp size={14} />
                  <span>Career Tools ({megaMenuGroups.careerTools?.items?.length || 0})</span>
                </div>
                {megaMenuGroups.careerTools?.items && megaMenuGroups.careerTools.items.length > 0 ? (
                  megaMenuGroups.careerTools.items.map((item, index) => (
                    <Link
                      key={item.href || index}
                      href={item.href}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${pathname === item.href
                        ? "bg-primary-50 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={(e) => {
                        if (item.onClick) item.onClick(e);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'}`}>
                          <item.icon size={16} className={pathname === item.href ? 'text-primary' : 'text-gray-600'} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.badgeText && (
                        <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full ${item.badgeColor}`}>
                          {item.badgeText}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-gray-500">No items available</div>
                )}
              </div>

              {/* Resources Section */}
              <div className="mt-6 mb-2">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  <BookOpen size={14} />
                  <span>Resources</span>
                </div>
                {resourcesMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${pathname === item.href
                      ? "bg-primary-50 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className={`p-1.5 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      <item.icon size={16} className={pathname === item.href ? 'text-primary' : 'text-gray-600'} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Other Section */}
              <div className="mt-6 mb-2">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                  <Settings size={14} />
                  <span>Other</span>
                </div>
                {otherMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.target || undefined}
                    rel={item.rel || undefined}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${pathname === item.href
                      ? "bg-primary-50 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={(e) => {
                      if (item.onClick) item.onClick(e);
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${pathname === item.href ? 'bg-primary-100' : 'bg-gray-100'}`}>
                        <item.icon size={16} className={pathname === item.href ? 'text-primary' : 'text-gray-600'} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.badgeText && (
                      <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full ${item.badgeColor}`}>
                        {item.badgeText}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Sign In/Up */}
              {!user && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 px-4 py-3 text-primary bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 font-semibold shadow-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 font-semibold shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Sparkles size={18} />
                      <span>Get Started Free</span>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu Animation Styles */}
      <style jsx global>{`
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .animate-slide-in-right {
        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      /* Custom scrollbar for mobile menu */
      .md\\:hidden nav::-webkit-scrollbar {
        width: 4px;
      }
      
      .md\\:hidden nav::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      .md\\:hidden nav::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      
      .md\\:hidden nav::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `}</style>
    </>
  );
}