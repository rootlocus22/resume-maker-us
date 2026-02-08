/**
 * Exit Intent WhatsApp Configuration
 * Customize the exit-intent popup behavior and content
 */

export const EXIT_INTENT_CONFIG = {
  // Your WhatsApp Business Number (country code + number, no + or spaces)
  whatsAppNumber: "918431256903", // TODO: Replace with your actual WhatsApp number
  
  // Trigger Settings
  triggers: {
    mouseLeave: true,           // Show when mouse leaves viewport
    tabClose: true,             // Show when user tries to close tab
    tabSwitch: true,            // Show when user switches to another tab
    backButton: true,           // Show when user clicks back button
    delayBeforeActivation: 5000 // Wait 5 seconds before activating (ms)
  },
  
  // Display Settings
  display: {
    showOnlyOnce: true,         // Show only once per session
    excludePaths: [             // Don't show on these paths
      '/checkout',
      '/payment',
      '/enterprise/checkout'
    ],
  },
  
  // Pre-filled WhatsApp Message
  message: 
    `Hi! I was just browsing ExpertResume and would like to know more about:\n\n` +
    `• Creating the perfect resume 📄\n` +
    `• ATS optimization tips ✅\n` +
    `• Premium plans and pricing 💎\n` +
    `• Job Description Resume Builder 🎯\n` +
    `• Resume GPT - AI-powered suggestions 🤖\n\n` +
    `Can you help me? 😊`,
  
  // Popup Content
  content: {
    title: "Wait! Don't Go Yet 👋",
    subtitle: "We're here to help you!",
    description: "Have questions about creating the perfect resume? Chat with us on WhatsApp for instant help! 💬",
    ctaText: "Chat on WhatsApp Now",
    
    // Benefits shown in popup
    benefits: [
      {
        icon: "Zap",
        text: "Get instant replies on WhatsApp",
        color: "green"
      },
      {
        icon: "Clock",
        text: "Available 24/7 to answer questions",
        color: "blue"
      },
      {
        icon: "Gift",
        text: "Get exclusive tips & special offers",
        color: "purple"
      }
    ],
    
    // Trust indicators
    trustIndicators: [
      "Trusted by 10,000+ users",
      "Response time: <5 min"
    ]
  },
  
  // Analytics (Google Analytics)
  tracking: {
    enabled: true,
    events: {
      popupShown: "exit_intent_whatsapp_triggered",
      whatsappClicked: "exit_intent_whatsapp_clicked",
      popupClosed: "exit_intent_whatsapp_closed"
    }
  },
  
  // Advanced Options
  advanced: {
    // Mouse sensitivity (how close to top before triggering)
    mouseLeaveSensitivity: 50, // pixels from top
    
    // Animation settings
    animations: {
      enabled: true,
      duration: 300,
      type: "spring" // "spring" or "tween"
    },
    
    // Mobile behavior
    mobile: {
      enabled: true,
      useFullScreen: false
    }
  }
};

// Helper function to get WhatsApp URL
export function getWhatsAppURL(customMessage = null) {
  const message = customMessage || EXIT_INTENT_CONFIG.message;
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile: Use app protocol for direct opening
    return `whatsapp://send?phone=${EXIT_INTENT_CONFIG.whatsAppNumber}&text=${encodeURIComponent(message)}`;
  } else {
    // For desktop: Use web.whatsapp.com for direct chat opening
    return `https://web.whatsapp.com/send?phone=${EXIT_INTENT_CONFIG.whatsAppNumber}&text=${encodeURIComponent(message)}`;
  }
}

// Helper function to check if should show on current path
export function shouldShowOnPath(pathname) {
  return !EXIT_INTENT_CONFIG.display.excludePaths.some(path => 
    pathname.startsWith(path)
  );
}

