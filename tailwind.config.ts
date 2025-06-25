import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '70': '17.5rem',
      },
      width: {
        '64': '16rem',
        '70': '17.5rem',
      }
    },
  },
  plugins: [],
} satisfies Config