/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a", // slate-900 for text
        surface: "#ffffff",
        surfaceMuted: "#f8fafc", // slate-50
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb', // blue-600
        },
        savings: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669', // emerald-600
        },
        alert: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626', // red-600
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#d97706', // amber-600
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          hover: '#0284c7', // sky-600
        },
        textMuted: "#64748b", // slate-500
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 3px rgba(0,0,0,0.02)',
        'premium-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 5px rgba(0,0,0,0.03)',
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
