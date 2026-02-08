"use client";
import { HexColorPicker } from "react-colorful";
import { allTemplates as templates } from "../lib/allTemplates";
import { useState, useEffect, useRef } from "react";

const PRESET_PALETTES = [
  { name: "Corporate", colors: { primary: "#1e3a8a", accent: "#3b82f6", secondary: "#64748b", text: "#1f2937", background: "#ffffff" } },
  { name: "Pastel", colors: { primary: "#a78bfa", accent: "#f472b6", secondary: "#f9a8d4", text: "#374151", background: "#ffffff" } },
  { name: "Bold", colors: { primary: "#dc2626", accent: "#fbbf24", secondary: "#4f46e5", text: "#111827", background: "#ffffff" } },
  { name: "Grayscale", colors: { primary: "#111827", accent: "#6b7280", secondary: "#9ca3af", text: "#374151", background: "#ffffff" } },
];

export default function ColorCustomizer({ template, colors = {}, onChange, onDone }) {
  const templateConfig = templates[template] || 
                         templates.classic || 
                         templates.modern_professional ||
                         Object.values(templates)[0] || 
                         {
                           styles: {
                             colors: {
                               primary: "#2c3e50",
                               secondary: "#7f8c8d", 
                               accent: "#3498db"
                             }
                           }
                         };
  const templateColors = templateConfig.styles.colors || {};
  const [activeColorKey, setActiveColorKey] = useState(null); // Track which color picker is open
  const colorPickerRef = useRef(null); // Ref to detect clicks outside

  const handleColorChange = (colorKey, color) => {
    onChange(colorKey, color); // Update color without closing picker
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setActiveColorKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center p-3 space-y-4" data-tour="color-panel">
      {/* Palette Chips */}
      <div className="w-full flex flex-wrap gap-2 justify-center">
        {PRESET_PALETTES.map((pal) => (
          <button
            key={pal.name}
            title={pal.name}
            onClick={() => {
              Object.entries(pal.colors).forEach(([k, v]) => onChange(k, v));
            }}
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all"
            style={{ background: `linear-gradient(135deg, ${pal.colors.primary} 0%, ${pal.colors.accent} 100%)` }}
          />
        ))}
      </div>
      {Object.keys(templateColors).map((colorKey) => (
        <div key={colorKey} className="relative flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600 mb-1 capitalize">
            {colorKey}
          </span>
          <button
            onClick={() => setActiveColorKey(colorKey)} // Always set to this colorKey, no toggle off
            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ backgroundColor: (colors && colors[colorKey]) || templateColors[colorKey] }}
            title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
          />
          {activeColorKey === colorKey && (
            <div
              ref={colorPickerRef}
              className="absolute left-12 top-8 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
            >
              <HexColorPicker
                color={(colors && colors[colorKey]) || templateColors[colorKey]}
                onChange={(color) => handleColorChange(colorKey, color)}
                className="!w-32 !h-32"
              />
              <input
                type="text"
                value={(colors && colors[colorKey]) || templateColors[colorKey]}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
                className="mt-2 w-full p-1 border border-gray-300 rounded-md text-xs text-gray-700 focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                placeholder="#HEX"
              />
            </div>
          )}
        </div>
      ))}

      {/* Reset to Defaults */}
      <button
        onClick={() => {
          Object.entries(templateColors).forEach(([k, v]) => onChange(k, v));
        }}
        className="mt-4 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-700 font-medium transition-all"
      >
        Reset Colours
      </button>

      {/* Done Button for modal/overlay */}
      {onDone && (
        <button
          onClick={onDone}
          className="mt-3 w-full px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-md font-semibold shadow-md hover:from-blue-700 hover:to-blue-700 transition-all"
        >
          Done
        </button>
      )}
    </div>
  );
}