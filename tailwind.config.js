module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // US theme – ExpertResume (Navy + Teal)
        primary: {
          DEFAULT: '#0B1F3B',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1F3650',
          900: '#0B1F3B',
        },
        accent: {
          DEFAULT: '#00C4B3',
          50: '#E6FAF8',
          100: '#B3F0EB',
          200: '#80E6DE',
          300: '#4DDCD1',
          400: '#1AD2C4',
          500: '#00C4B3',
          600: '#00A89A',
          700: '#008C80',
          800: '#007067',
          900: '#00544D',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
        bg: '#F8FAFC',
        border: '#E5E7EB',
        textPrimary: '#0B1F3B',
        textSecondary: '#475569',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  plugins: [],
};
