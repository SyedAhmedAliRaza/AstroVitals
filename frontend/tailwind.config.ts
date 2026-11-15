import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "space-dark": "#0a0e1a",
        "space-navy": "#111827",
        "space-blue": "#1e3a5f",
        "astro-green": "#10b981",
        "astro-amber": "#f59e0b",
        "astro-red": "#ef4444",
        "astro-cyan": "#06b6d4",
        "astro-purple": "#8b5cf6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-green": "glowGreen 2s ease-in-out infinite alternate",
        "glow-amber": "glowAmber 2s ease-in-out infinite alternate",
        "glow-red": "glowRed 1.5s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
      keyframes: {
        glowGreen: {
          "0%": { filter: "drop-shadow(0 0 2px #10b981)" },
          "100%": { filter: "drop-shadow(0 0 12px #10b981)" },
        },
        glowAmber: {
          "0%": { filter: "drop-shadow(0 0 2px #f59e0b)" },
          "100%": { filter: "drop-shadow(0 0 12px #f59e0b)" },
        },
        glowRed: {
          "0%": { filter: "drop-shadow(0 0 3px #ef4444)" },
          "100%": { filter: "drop-shadow(0 0 18px #ef4444)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
