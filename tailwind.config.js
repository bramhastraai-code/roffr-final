/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      marcellus: ["Marcellus", "sans-serif"],
      urbanist: ["Urbanist", "sans-serif"],
      outfit: ["Outfit", "sans-serif"],
      inter: ["Inter", "sans-serif"],
      intertight: ["Inter Tight", "sans-serif"],
      instument: ["Instrument Serif", "sans-serif"],
      // Restores font-sans, which the fontFamily override above had removed —
      // anything without an explicit font class was falling back to Times.
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    extend: {
      // ── Design tokens ──────────────────────────────────────────────
      // Use these instead of hardcoding hex values. The codebase currently
      // has ~410 arbitrary colour utilities and five competing brand reds
      // (#EB3131, #FF5722, #EF4444, #E63946, orange-500); new work should
      // use `brand`, and existing usages migrate opportunistically.
      colors: {
        brand: {
          DEFAULT: "#EB3131", // primary action
          dark: "#C72828",    // hover / pressed
          light: "#FEF2F2",   // tinted surface (red-50 equivalent)
          gold: "#DDA439",    // gradient partner
          amber: "#E8820C",   // secondary accent
        },
        ink: {
          DEFAULT: "#1A2B5F", // headings / navy
          soft: "#5B6771",
          muted: "#8C9AAB",
        },
      },
      borderRadius: {
        // Card = 2xl(16) or 3xl(24); pill = full. Avoid inventing new radii.
        card: "1.5rem",
        control: "0.75rem",
      },
      boxShadow: {
        // Three elevations. Prefer these over shadow-sm..2xl grab-bag.
        e1: "0 1px 2px rgba(16, 24, 40, 0.06)",
        e2: "0 4px 16px rgba(16, 24, 40, 0.08)",
        e3: "0 12px 32px rgba(16, 24, 40, 0.12)",
      },
      screens: {
        sm: "640px", // Small devices (landscape phones, 640px and up)
        md: "768px", // Medium devices (tablets, 768px and up)
        lg: "1024px", // Large devices (desktops, 1024px and up)
        xl: "1280px", // Extra large devices (large desktops, 1280px and up)
        "2xl": "1536px", // 2x Extra large devices (larger desktops, 1536px and up)
        // Custom breakpoints
        xs: "340px", // Extra small devices (phones, 480px and up)
        "3xl": "1700px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
      });
    },
  ],
}

