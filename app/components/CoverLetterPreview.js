"use client";
import { useState, useEffect, useRef } from "react";
import { Phone, Mail, MapPin, Calendar, Briefcase, Award } from "lucide-react";
import { coverLetterTemplates } from "../lib/coverLetterTemplate";

export default function CoverLetterPreview({ data, template, customColors, resumeData, isPremium }) {
  const templateConfig = coverLetterTemplates[template] || coverLetterTemplates.classic;
  const baseStyles = templateConfig.styles;
  const styles = {
    ...baseStyles,
    colors: {
      ...baseStyles.colors,
      ...(customColors[template] || {}),
    },
  };

  const layout = { headerStyle: templateConfig.layout?.headerStyle || "compact" };
  const mergedColors = styles.colors;

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const containerWidth = 700;
      const screenWidth = window.innerWidth;
      const newScale = Math.min(1, screenWidth / containerWidth);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const getFieldValue = (field) => {
    const fieldMappings = {
      name: [data.name, resumeData?.personal?.name, "Your Name"],
      email: [data.email, resumeData?.personal?.email, "email@example.com"],
      phone: [data.phone, resumeData?.personal?.phone, "123-456-7890"],
      location: [data.location, resumeData?.personal?.location, "City, State"],
      jobTitle: [data.jobTitle, resumeData?.experience?.[0]?.title, "[jobTitle]"],
      company: [data.company, resumeData?.experience?.[0]?.company, "[company]"],
      recipient: [data.recipient, "Dear Hiring Manager"],
      intro: [data.intro, templateConfig.defaultData.intro],
      body: [data.body, templateConfig.defaultData.body],
      closing: [data.closing, templateConfig.defaultData.closing],
    };
    return fieldMappings[field].find((val) => val !== undefined && val !== "") || fieldMappings[field][fieldMappings[field].length - 1];
  };

  const renderModernHeader = () => (
    <div className="border-b-2 border-primary pb-6 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {getFieldValue("name")}
          </h1>
          <p className="text-base sm:text-lg text-primary font-semibold mb-4">
            {getFieldValue("jobTitle")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 mt-4">
        <span className="flex items-center gap-2">
          <Mail size={14} className="text-primary flex-shrink-0" />
          <span className="break-all">{getFieldValue("email")}</span>
        </span>
        <span className="flex items-center gap-2">
          <Phone size={14} className="text-primary flex-shrink-0" />
          {getFieldValue("phone")}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={14} className="text-primary flex-shrink-0" />
          {getFieldValue("location")}
        </span>
      </div>
    </div>
  );

  const renderExecutiveHeader = () => (
    <div className="border-b-4 border-gray-900 pb-6 mb-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
          {getFieldValue("name")}
        </h1>
        <div className="w-20 h-0.5 bg-gray-900 mx-auto mb-4"></div>
        <p className="text-base sm:text-lg text-gray-700 font-semibold mb-6">
          {getFieldValue("jobTitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-900 flex-shrink-0" />
            <span className="break-all">{getFieldValue("email")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-900 flex-shrink-0" />
            <span>{getFieldValue("phone")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-900 flex-shrink-0" />
            <span>{getFieldValue("location")}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalistHeader = () => (
    <div className="border-l-4 border-gray-800 pl-4 sm:pl-6 mb-8">
      <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2 tracking-wide">
        {getFieldValue("name")}
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mb-4 font-light">
        {getFieldValue("jobTitle")}
      </p>
      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <Mail size={14} className="text-gray-800 flex-shrink-0" />
          <span className="break-all">{getFieldValue("email")}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone size={14} className="text-gray-800 flex-shrink-0" />
          <span>{getFieldValue("phone")}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={14} className="text-gray-800 flex-shrink-0" />
          <span>{getFieldValue("location")}</span>
        </div>
      </div>
    </div>
  );

  const renderCreativeHeader = () => (
    <div className="relative mb-8 border-l-4 border-gray-800 pl-4 sm:pl-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {getFieldValue("name")}
      </h1>
      <p className="text-base sm:text-lg text-gray-700 font-semibold mb-4">
        {getFieldValue("jobTitle")}
      </p>
      <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <Mail size={14} className="text-gray-800 flex-shrink-0" />
          <span className="break-all">{getFieldValue("email")}</span>
        </span>
        <span className="flex items-center gap-2">
          <Phone size={14} className="text-gray-800 flex-shrink-0" />
          {getFieldValue("phone")}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-800 flex-shrink-0" />
          {getFieldValue("location")}
        </span>
      </div>
    </div>
  );

  const renderTechHeader = () => (
    <div className="border-b-2 border-gray-800 pb-6 mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            {getFieldValue("name")}
          </h1>
          <p className="text-base sm:text-lg text-gray-700 font-medium mb-4">
            {getFieldValue("jobTitle")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 mt-4">
        <span className="flex items-center gap-2">
          <Mail size={14} className="text-gray-800 flex-shrink-0" />
          <span className="break-all">{getFieldValue("email")}</span>
        </span>
        <span className="flex items-center gap-2">
          <Phone size={14} className="text-gray-800 flex-shrink-0" />
          {getFieldValue("phone")}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-800 flex-shrink-0" />
          {getFieldValue("location")}
        </span>
      </div>
    </div>
  );

  const renderClassicHeader = () => (
    <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3">
        {getFieldValue("name")}
      </h1>
      <p className="text-gray-600 text-base sm:text-lg mb-4">
        {getFieldValue("jobTitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600">
        <span className="break-all">{getFieldValue("email")}</span>
        <span className="hidden sm:inline">•</span>
        <span>{getFieldValue("phone")}</span>
        <span className="hidden sm:inline">•</span>
        <span>{getFieldValue("location")}</span>
      </div>
    </div>
  );

  const renderHeader = () => {
    switch (layout.headerStyle) {
      case "modern":
      case "full-width":
      case "startup":
        return renderModernHeader();
      case "executive":
        return renderExecutiveHeader();
      case "minimal":
      case "minimalist":
        return renderMinimalistHeader();
      case "creative":
      case "default":
        return renderCreativeHeader();
      case "innovate":
        return renderTechHeader();
      case "compact":
      case "classic":
      default:
        return renderClassicHeader();
    }
  };

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full"
      style={{
        maxWidth: "210mm",
        transform: window.innerWidth >= 1024 ? `scale(${scale})` : 'none',
        transformOrigin: "top left",
        position: "relative",
      }}
    >
      <div
        className="relative bg-white transition-all duration-300"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          color: styles.colors.text,
          background: styles.colors.background,
          minHeight: "auto",
        }}
      >
        {/* Main Content */}
        <div className="p-6 sm:p-8 lg:p-12">
          {renderHeader()}

          {/* Date and Recipient */}
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
              {getFieldValue("recipient")}
            </p>
            <p className="text-sm sm:text-base text-gray-700">
              {getFieldValue("company")}
            </p>
          </div>

          {/* Letter Content */}
          <div className="space-y-5">
            {/* Introduction */}
            <div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-800" style={{ textAlign: 'justify' }}>
                {getFieldValue("intro")}
              </p>
            </div>

            {/* Body */}
            <div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-800" style={{ textAlign: 'justify' }}>
                {getFieldValue("body")}
              </p>
            </div>

            {/* Closing */}
            <div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-800" style={{ textAlign: 'justify' }}>
                {getFieldValue("closing")}
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8">
              <p className="text-sm sm:text-base text-gray-700 mb-3">Sincerely,</p>
              <div className="border-b-2 border-gray-300 w-32 sm:w-40 mb-2"></div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {getFieldValue("name")}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {getFieldValue("jobTitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer decoration based on template */}
        {(layout.headerStyle === "modern" || layout.headerStyle === "startup") && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
        )}

        {layout.headerStyle === "executive" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900"></div>
        )}

        {(layout.headerStyle === "creative" || layout.headerStyle === "default") && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"></div>
        )}

        {/* Watermark for non-premium users */}
        {!isPremium && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              color: "rgba(150, 150, 150, 0.15)",
              fontSize: "60px",
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              pointerEvents: "none",
              textAlign: "center",
              whiteSpace: "nowrap",
              letterSpacing: "4px",
            }}
          >
            EXPERTRESUME
          </div>
        )}
      </div>
    </div>
  );
}
