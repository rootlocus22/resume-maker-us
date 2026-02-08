"use client";
import dynamic from "next/dynamic";

// Lazy load below-the-fold components with ssr: false to reduce initial HTML size
const NewFeatures = dynamic(() => import("./NewFeatures"), { ssr: false });
const ProfessionalTemplateSlider = dynamic(() => import("./ProfessionalTemplateSlider"), { ssr: false });
const ResumeIssues = dynamic(() => import("./ResumeIssues"), { ssr: false });
const CareerJourney = dynamic(() => import("./CareerJourney"), { ssr: false });
const NewPricing = dynamic(() => import("./NewPricing"), { ssr: false });
const EnhancedTestimonials = dynamic(() => import("./EnhancedTestimonials"), { ssr: false });
const FinalCTA = dynamic(() => import("./FinalCTA"), { ssr: false });
const StickyBottomCTA = dynamic(() => import("./StickyBottomCTA"), { ssr: false });

export default function HomePageLazyContent() {
    return (
        <>
            <NewFeatures />
            <ProfessionalTemplateSlider />
            <ResumeIssues />
            <ResumeIssues />
            <CareerJourney />
            <NewPricing />
            <EnhancedTestimonials />
            <FinalCTA />
            <StickyBottomCTA />
        </>
    );
}
