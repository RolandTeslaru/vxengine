import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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
      margin: {
        'containerDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 3vh 1vw ',
        'containerMobile': 'calc(3vh + 50px) 1vw 3vh 1vw ',
        'scrollDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 0 1vw ',
      },
      gridTemplateColumns: {
        '3upper': '1.05fr 1.9fr 1.05fr'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'logs-img': "url('/images/LogPng.png')",
        'code-img': "url('/images/code.png')",
        'analytics-img': "url('/images/Analytics.png')",
        "world-img": "url('/images/world.png)",
        'vision-pro': "url('/images/VisionPro.img)",
        'bmw': "url('/images/Bmw.img)"
      },
      fontFamily: {
        'sans-menlo': ['Sans Menlo', 'sans'], 
        'work-sans': ['Work Sans', 'sans-menlo'],
        'inter': ['Inter', 'sans-menlo'],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config