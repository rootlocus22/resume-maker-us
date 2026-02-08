"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import NewHero from "./NewHero";
import NewFeatures from "./NewFeatures";
import ProfessionalTemplateSlider from "./ProfessionalTemplateSlider";
import ResumeIssues from "./ResumeIssues";
import CareerJourney from "./CareerJourney";
import NewPricing from "./NewPricing";
import EnhancedTestimonials from "./EnhancedTestimonials";
import FinalCTA from "./FinalCTA";
import Hero from "./Hero";
import StickyBottomCTA from "./StickyBottomCTA";

export default function HomePageWrapper() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in users to /my-resumes
    if (!loading && user) {
      router.push("/my-resumes");
    }
  }, [user, loading, router]);

  // Loading state is handled in background to ensure LCP for SEO
  // Start rendering immediately regardless of auth state

  // Render homepage for non-logged-in users
  return (
    <>
      {/*  <NewHero /> */}
      <Hero></Hero>
      <NewFeatures />
      <ProfessionalTemplateSlider />
      <ResumeIssues />
      <ResumeIssues />
      <CareerJourney />
      <NewPricing />
      <EnhancedTestimonials />
      {/*    <FinalCTA /> */}
      <FinalCTA />
      <StickyBottomCTA />
    </>
  );
}
