import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-tint": "#54634a",
        "primary-fixed": "#d8e8c8",
        "secondary": "#765749",
        "inverse-primary": "#bcccae",
        "surface-container": "#f0eded",
        "tertiary-container": "#b05f35",
        "secondary-container": "#fed4c2",
        "surface-container-low": "#f6f3f2",
        "surface-container-high": "#eae8e7",
        "surface-variant": "#e4e2e1",
        "on-primary-container": "#f8ffed",
        "outline": "#75786f",
        "background": "#fbf9f8",
        "on-tertiary-container": "#fffbff",
        "inverse-surface": "#303030",
        "surface-container-lowest": "#ffffff",
        "on-primary": "#ffffff",
        "on-background": "#1b1c1c",
        "surface": "#fbf9f8",
        "on-tertiary-fixed-variant": "#76330b",
        "on-primary-fixed": "#131f0b",
        "on-secondary-fixed": "#2c160b",
        "inverse-on-surface": "#f3f0f0",
        "on-tertiary": "#ffffff",
        "on-surface": "#1b1c1c",
        "surface-container-highest": "#e4e2e1",
        "error-container": "#ffdad6",
        "surface-dim": "#dcd9d9",
        "primary": "#526048",
        "tertiary-fixed": "#ffdbcc",
        "on-secondary-fixed-variant": "#5c4033",
        "secondary-fixed": "#ffdbcc",
        "on-primary-fixed-variant": "#3d4b34",
        "primary-fixed-dim": "#bcccae",
        "on-error-container": "#93000a",
        "on-secondary-container": "#795a4c",
        "surface-bright": "#fbf9f8",
        "tertiary": "#91471f",
        "on-secondary": "#ffffff",
        "primary-container": "#6a795f",
        "tertiary-fixed-dim": "#ffb693",
        "on-tertiary-fixed": "#351000",
        "on-surface-variant": "#444840",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#e6bead",
        "outline-variant": "#c5c8bd"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "base-unit": "8px",
        "container-margin-desktop": "64px",
        "gutter": "16px",
        "section-gap": "40px",
        "container-margin-mobile": "20px"
      },
      fontFamily: {
        "label-sm": ["DM Sans"],
        "display-lg": ["Libre Caslon Text"],
        "body-md": ["DM Sans"],
        "label-md": ["DM Sans"],
        "body-lg": ["DM Sans"],
        "headline-lg-mobile": ["Libre Caslon Text"],
        "headline-lg": ["Libre Caslon Text"],
        "headline-md": ["Libre Caslon Text"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "700" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }]
      }
    }
  },
  plugins: [],
};
export default config;
