/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB", // Royal Blue
          hover: "#1D4ED8",
        },
        savings: {
          DEFAULT: "#10B981", // Clean Emerald Green
          hover: "#059669",
        },
        alert: {
          DEFAULT: "#EF4444", // Polished Crimson Red
          hover: "#DC2626",
        },
        warning: {
          DEFAULT: "#F59E0B", // Soft Amber Yellow
          hover: "#D97706",
        },
        info: {
          DEFAULT: "#3B82F6", // Blue
          hover: "#2563EB",
        },
        surface: "#FFFFFF",
        surfaceMuted: "#F1F5F9", // Slate 100
        background: "#F8FAFC", // Slate 50
        border: "#E2E8F0", // Slate 200
        text: "#0F172A", // Slate 900
        textMuted: "#64748B", // Slate 500
      },
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        display: ["'Inter'", "sans-serif"], // Reverting display to Inter
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
