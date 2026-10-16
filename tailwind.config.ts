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
        // Light surfaces: page, raised panels, hairlines
        paper: {
          DEFAULT: "#ffffff",
          soft: "#f7f6f3",
          line: "#e6e2da",
        },
        // Dark: body copy on white, and scrims/overlays on top of photography
        ink: {
          DEFAULT: "#17171c",
          muted: "#6d6d75",
        },
        // Warm metal accent; DEFAULT passes AA on white, light is for dark scrims
        brass: {
          DEFAULT: "#836726",
          light: "#d8bd7f",
          dark: "#5f4b1b",
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
      boxShadow: {
        soft: "0 1px 2px rgba(23, 23, 28, 0.04), 0 14px 34px -18px rgba(23, 23, 28, 0.18)",
        lift: "0 2px 6px rgba(23, 23, 28, 0.05), 0 26px 50px -24px rgba(23, 23, 28, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
