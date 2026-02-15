/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // ========================================
        // US Theme – ExpertResume (Navy + Teal)
        // Primary: Deep Navy for trust & authority
        // Accent: Teal for action & success
        // ========================================
        primary: {
          DEFAULT: "#0B1F3B",
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#1F3650",
          900: "#0B1F3B",
        },
        accent: {
          DEFAULT: "#00C4B3",
          50: "#E6FAF8",
          100: "#B3F0EB",
          200: "#80E6DE",
          300: "#4DDCD1",
          400: "#1AD2C4",
          500: "#00C4B3",
          600: "#00A89A",
          700: "#008C80",
          800: "#007067",
          900: "#00544D",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#DC2626",
        bg: "#F8FAFC",
        border: "#E5E7EB",
        textPrimary: "#0B1F3B",
        textSecondary: "#475569",

        // Keep standard Tailwind overrides consistent
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563EB",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#E5E7EB",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0F172A",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};
