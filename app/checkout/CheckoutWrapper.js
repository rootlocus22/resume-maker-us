"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ClientCheckout from "./ClientCheckout";
import ExitIntentDiscountPopup from "../components/ExitIntentDiscountPopup";
import { ExitIntentDetector } from "../lib/exitIntent";

export default function CheckoutWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showExitDiscount, setShowExitDiscount] = useState(false);
  const [exitDiscountData, setExitDiscountData] = useState(null);
  const [triggerInfo, setTriggerInfo] = useState(null);
  const [originalPlan, setOriginalPlan] = useState(null);
  
  // Plan definitions matching the popup
  const planDefinitions = {
    trial: {
      name: "7-Day Trial",
      originalPrice: 99,
      duration: 7,
      planType: 'trial'
    },
    monthly: {
      name: "Premium Monthly",
      originalPrice: 399,
      discountedPrice: 199,
      duration: 30,
      planType: 'monthly'
    },
    yearly: {
      name: "Premium Yearly",
      originalPrice: 1299,
      discountedPrice: 1999,
      duration: 365,
      planType: 'yearly'
    }
  };

  useEffect(() => {
    const cycle = searchParams.get("billingCycle");
    const persona = searchParams.get("persona");
    const type = searchParams.get("type");
    
    // Check if this should be an enterprise checkout
    const isEnterpriseCheckout = 
      type === "enterprise" ||
      persona === "enterprise" ||
      ["starter", "business", "enterprise"].includes(cycle);
    
    if (isEnterpriseCheckout) {
      // Redirect to enterprise checkout
      const params = new URLSearchParams();
      if (cycle) params.set("plan", cycle);
      if (searchParams.get("billingCycle")) params.set("billingCycle", searchParams.get("billingCycle"));
      
      router.push(`/enterprise/checkout?${params.toString()}`);
      return;
    }
    
    // For regular checkout, validate the billing cycle and map to plan definitions
    let detectedPlan = "monthly"; // default
    
    if (cycle && ["monthly", "sixMonth", "yearly", "trial"].includes(cycle)) {
      setBillingCycle(cycle);
      detectedPlan = cycle;
    } else {
      setBillingCycle("monthly");
    }
    
    // Set original plan from our plan definitions
    setOriginalPlan(planDefinitions[detectedPlan]);
  }, [searchParams, router]);

  // DISABLED DISCOUNT FEATURES - NO MORE 50% OFF POPUPS
  // useEffect(() => {
  //   const detector = new ExitIntentDetector({
  //     delay: 1000,
  //     maxDisplays: 1,
  //     threshold: 25,
  //     sensitivity: 15
  //   });
    
  //   // Register the callback using the onExitIntent method
  //   detector.onExitIntent((trigger, timeOnPage) => {
  //     if (!showExitDiscount && !exitDiscountData) {
  //       const info = { trigger, timeOnPage };
  //       setTriggerInfo(info);
  //       setShowExitDiscount(true);
        
  //       // Track exit intent trigger
  //       if (typeof window !== 'undefined' && window.gtag) {
  //         window.gtag('event', 'exit_intent_triggered', {
  //           event_category: 'Engagement',
  //           event_label: trigger,
  //           custom_parameters: {
  //             trigger_type: trigger,
  //             time_on_page: timeOnPage,
  //             page_path: window.location.pathname
  //           }
  //         });
  //       }
  //     }
  //   });

  //   return () => {
  //     detector.destroy();
  //   };
  // }, [showExitDiscount, exitDiscountData]);

  const handleExitDiscountAccept = (discountData) => {
    setExitDiscountData(discountData);
    setShowExitDiscount(false);
    
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_discount_conversion', {
        event_category: 'Conversion',
        event_label: discountData.selectedPlan,
        value: discountData.discountedPrice,
        custom_parameters: {
          original_price: discountData.originalPrice,
          discount_amount: discountData.savings,
          selected_plan: discountData.selectedPlan,
          discount_code: discountData.discountCode
        }
      });
    }
  };

  const handleExitDiscountClose = () => {
    setShowExitDiscount(false);
    
    // Track dismissal
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_discount_dismissed', {
        event_category: 'Engagement',
        event_label: triggerInfo?.trigger || 'unknown',
        custom_parameters: {
          trigger_type: triggerInfo?.trigger,
          time_on_page: triggerInfo?.timeOnPage
        }
      });
    }
  };

  return (
    <>
      {/* Regular consumer checkout */}
      <ClientCheckout 
        initialBillingCycle={billingCycle}
        exitDiscountData={exitDiscountData}
        originalPlan={originalPlan}
      />
      
      {/* DISABLED DISCOUNT POPUP - NO MORE 50% OFF OFFERS */}
      {/* <ExitIntentDiscountPopup
        isVisible={showExitDiscount}
        onClose={handleExitDiscountClose}
        onAccept={handleExitDiscountAccept}
        originalPlan={originalPlan}
        originalPrice={originalPlan?.originalPrice}
        triggerInfo={triggerInfo}
      /> */}
    </>
  );
}
