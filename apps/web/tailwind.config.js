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
        savings: "#1E8E3E",
        alert: "#D93025",
        warning: "#F2B705",
        info: "#1A73E8",
        textMuted: "#5F6368",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        neobrutal: "4px 4px 0px 0px #0A0A0A",
        "neobrutal-sm": "2px 2px 0px 0px #0A0A0A",
        "neobrutal-lg": "6px 6px 0px 0px #0A0A0A",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
}
