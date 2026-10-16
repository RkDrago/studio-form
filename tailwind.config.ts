import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0b0c",
          soft: "#131316",
          line: "#26262b",
        },
        sand: {
          DEFAULT: "#e8e2d8",
          muted: "#a8a29a",
        },
        brass: {
          DEFAULT: "#c8a25a",
          light: "#e0c084",
          dark: "#8f7132",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      maxWidth: {
        shell: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
