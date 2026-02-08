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
          50: '#E8ECF2',
          100: '#C5D0E0',
          200: '#9FB3CC',
          300: '#7896B8',
          400: '#4A6B96',
          500: '#0B1F3B',
          600: '#091932',
          700: '#071429',
          800: '#050F20',
          900: '#030A17',
        },
        accent: {
          DEFAULT: '#00C4B3',
          50: '#E6FAF8',
          100: '#B3F0EB',
          200: '#80E6DE',
          300: '#4DDCD1',
          400: '#00C4B3',
          500: '#00A89A',
          600: '#008C81',
          700: '#007068',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**", // Allows any path under /a/ (e.g., profile images)
      },
      // Add other domains if needed (e.g., for other external images)
    ],
  },

  plugins: [],
};