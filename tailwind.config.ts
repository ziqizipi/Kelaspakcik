import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors (warm tonal layers)
        background: "#fbf9f6",
        "surface-dim": "#dbdad7",
        "surface-bright": "#fbf9f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f0",
        "surface-container": "#efeeeb",
        "surface-container-high": "#eae8e5",
        "surface-container-highest": "#e4e2df",
        "surface-variant": "#e4e2df",
        "surface-muted": "#f0ede8",

        // Text colors
        "on-surface": "#1b1c1a",
        "on-surface-variant": "#404942",

        // Inverse surfaces
        "inverse-surface": "#30312f",
        "inverse-on-surface": "#f2f0ed",

        // Primary (forest green)
        primary: {
          DEFAULT: "#004526",
          50: "#e8f5ee",
          100: "#d1ebdd",
          200: "#a3d7bb",
          300: "#75c399",
          400: "#47af77",
          500: "#1a5e3a",
          600: "#164d31",
          700: "#123e28",
          800: "#0e2f1f",
          900: "#0a2116",
        },
        "on-primary": "#ffffff",
        "primary-container": "#1a5e3a",
        "on-primary-container": "#92d5a8",
        "inverse-primary": "#92d5a8",
        "surface-tint": "#286a45",

        // Secondary (gold)
        secondary: {
          DEFAULT: "#795900",
          50: "#fdf8e8",
          100: "#f9efd1",
          200: "#ffdf9f",
          300: "#eec058",
          400: "#fece65",
          500: "#d4a843",
          600: "#b8923a",
          700: "#795900",
        },
        "on-secondary": "#ffffff",
        "secondary-container": "#fece65",
        "on-secondary-container": "#755700",

        // Tertiary (blue-gray)
        tertiary: {
          DEFAULT: "#2b3d4f",
          50: "#e8eef4",
          100: "#d1dde9",
          200: "#a3bbd3",
          300: "#7599bd",
          400: "#4777a7",
          500: "#2b3d4f",
          600: "#223241",
          700: "#1a2733",
          800: "#111c25",
          900: "#091117",
        },
        "on-tertiary": "#ffffff",
        "tertiary-container": "#425467",
        "on-tertiary-container": "#b5c8de",

        // Fixed colors
        "primary-fixed": "#adf2c3",
        "primary-fixed-dim": "#92d5a8",
        "on-primary-fixed": "#00210f",
        "on-primary-fixed-variant": "#07522f",
        "secondary-fixed": "#ffdf9f",
        "secondary-fixed-dim": "#eec058",
        "on-secondary-fixed": "#261a00",
        "on-secondary-fixed-variant": "#5b4300",
        "tertiary-fixed": "#d1e4fb",
        "tertiary-fixed-dim": "#b5c8df",
        "on-tertiary-fixed": "#091d2e",
        "on-tertiary-fixed-variant": "#36485b",

        // Error
        error: {
          DEFAULT: "#ba1a1a",
          50: "#ffdad6",
          100: "#ffb4ab",
          200: "#ff8a7f",
          300: "#ff5449",
          400: "#e5311f",
          500: "#ba1a1a",
          600: "#a61212",
          700: "#93000a",
        },
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Brand colors
        whatsapp: "#25D366",
        "success-deep": "#144a2d",
        "alert-warning": "#d4a843",

        // Border colors
        outline: "#707971",
        "outline-variant": "#bfc9bf",
        border: "#e5e2dd",

        // UI colors
        foreground: "#1b1c1a",
        card: "#ffffff",
        muted: "#f0ede8",
        "muted-foreground": "#777777",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "56px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-0.01em" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.05em" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
      spacing: {
        "2xs": "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      boxShadow: {
        "level-1": "0 4px 20px rgba(0,69,38,0.04)",
        "level-2": "0 8px 30px rgba(0,0,0,0.08)",
        "level-3": "0 8px 24px rgba(0,0,0,0.15)",
        card: "0 4px 20px rgba(0,69,38,0.04)",
        popover: "0 8px 30px rgba(0,0,0,0.08)",
        modal: "0 8px 24px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;