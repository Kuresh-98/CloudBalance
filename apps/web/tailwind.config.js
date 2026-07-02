/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        surface: "#FFFFFF",
        surfaceMuted: "#FAFAF7",
        savings: {
          DEFAULT: "#1E8E3E",
          hover: "#177631",
        },
        alert: {
          DEFAULT: "#D93025",
          hover: "#B3271E",
        },
        warning: {
          DEFAULT: "#F2B705",
          hover: "#D4A004",
        },
        info: {
          DEFAULT: "#1A73E8",
          hover: "#155CBF",
        },
        textMuted: "#5F6368",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        'brutal': '4px 4px 0px var(--tw-shadow-color)',
        'brutal-hover': '2px 2px 0px var(--tw-shadow-color)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
