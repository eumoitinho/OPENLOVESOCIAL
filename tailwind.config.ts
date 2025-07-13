import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // OpenLove brand colors
        openlove: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          950: "#500724",
        },
        // Chat theme colors for light/dark mode
        chat: {
          bg: {
            light: "#FFFFFF",
            dark: "#0f0f23",
          },
          bgSecondary: {
            light: "#f8fafc",
            dark: "#1a1a2e",
          },
          text: {
            light: "#1e293b",
            dark: "#f1f5f9",
          },
          textSecondary: {
            light: "#64748b",
            dark: "#94a3b8",
          },
          border: {
            light: "#e2e8f0",
            dark: "#334155",
          },
          primary: {
            light: "#ec4899",
            dark: "#f472b6",
          },
          muted: {
            light: "#f1f5f9",
            dark: "#334155",
          },
          accent: {
            light: "#fce7f3",
            dark: "#831843",
          },
        },
        // Extended color palette
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          950: "#500724",
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-in-out",
        "fade-out": "fade-out 0.5s ease-in-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(236, 72, 153, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(236, 72, 153, 0.8)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-openlove": "linear-gradient(135deg, #be185d 0%, #e11d48 50%, #9333ea 100%)",
        "gradient-openlove-light": "linear-gradient(135deg, #fce7f3 0%, #ffe4e6 50%, #f3e8ff 100%)",
      },
      boxShadow: {
        "inner-lg": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(236, 72, 153, 0.3)",
        "glow-lg": "0 0 40px rgba(236, 72, 153, 0.4)",
        openlove: "0 10px 25px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)",
      },
      screens: {
        xs: "360px",
        "3xl": "1600px",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/3": "2 / 3",
        "9/16": "9 / 16",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      transitionDuration: {
        "2000": "2000ms",
        "3000": "3000ms",
      },
      scale: {
        "102": "1.02",
        "103": "1.03",
        "98": "0.98",
        "97": "0.97",
      },
      rotate: {
        "1": "1deg",
        "2": "2deg",
        "3": "3deg",
      },
      blur: {
        xs: "2px",
        "4xl": "72px",
        "5xl": "96px",
      },
      brightness: {
        "25": ".25",
        "175": "1.75",
      },
      contrast: {
        "25": ".25",
        "175": "1.75",
      },
      grayscale: {
        "50": ".5",
      },
      hueRotate: {
        "15": "15deg",
        "30": "30deg",
        "60": "60deg",
        "90": "90deg",
      },
      invert: {
        "25": ".25",
        "50": ".5",
        "75": ".75",
      },
      saturate: {
        "25": ".25",
        "75": ".75",
        "125": "1.25",
        "175": "1.75",
        "200": "2",
      },
      sepia: {
        "25": ".25",
        "75": ".75",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
