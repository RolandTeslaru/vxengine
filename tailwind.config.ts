import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    typography: {
      DEFAULT: {

      }
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        "xss": '8px', // 10px
      },
      margin: {
        'containerDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 3vh 1vw ',
        'containerMobile': 'calc(3vh + 50px) 1vw 3vh 1vw ',
        'scrollDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 0 1vw ',
      },
      gridTemplateColumns: {
        '3upper': '1.05fr 1.9fr 1.05fr'
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
        "moveBackground": {
          '0%': { backgroundPosition: '0 0' }, // Starting position
          '100%': { backgroundPosition: '40px 40px' } // Move 40px in both directions (diagonally)
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "moveBackground": 'moveBackground 2s linear infinite', 
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ],
  
} satisfies Config

export default config