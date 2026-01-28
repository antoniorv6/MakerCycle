/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MakerCycle Brand Colors - Based on Logo
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef2a1f',  // Logo primary red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        coral: {
          50: '#fdf5f4',
          100: '#fbe9e7',
          200: '#f8d5d2',
          300: '#f2b5b0',
          400: '#e88a83',
          500: '#d05f5a',  // Logo coral accent
          600: '#bc4a45',
          700: '#9d3b37',
          800: '#833532',
          900: '#6e302e',
          950: '#3b1614',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#161616',  // Logo black
          950: '#010101',  // Pure black from logo
        },
        cream: {
          50: '#fdfcfb',
          100: '#f9f6f4',
          200: '#f3ede9',
          300: '#e3d7d5',  // Logo beige
          400: '#d4c4c1',
          500: '#b9a5a1',
          600: '#9c8581',
          700: '#826d69',
          800: '#6c5b58',
          900: '#5a4d4b',
          950: '#302827',
        },
        // Keep semantic colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '70': '17.5rem',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      width: {
        '64': '16rem',
        '70': '17.5rem',
      },
      minHeight: {
        'screen-safe': ['100vh', '100dvh'],
      },
      height: {
        'screen-safe': ['100vh', '100dvh'],
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 42, 31, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(239, 42, 31, 0.5)' },
        },
      },
      screens: {
        'xs': '375px',
        'touch': { 'raw': '(hover: none)' },
        'pointer': { 'raw': '(hover: hover)' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ef2a1f 0%, #d05f5a 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
        'dark-gradient': 'linear-gradient(135deg, #161616 0%, #2d2d2d 100%)',
        'cream-gradient': 'linear-gradient(135deg, #fdfcfb 0%, #e3d7d5 100%)',
      },
    },
  },
  plugins: [],
}
