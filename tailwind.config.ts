import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Stitch Design System
        primary: '#33ff86',
        'primary-foreground': '#0a1a0f',
        background: '#080808',
        foreground: '#f8f8f8',
        'subtle-foreground': '#a1a1a1',
        'subtle-background': '#1c1c1c',
        'interactive-hover': '#2e2e2e',
        border: '#2e2e2e',
        accent: '#E140E1',

        // Legacy support (keeping for backward compatibility)
        dark: {
          primary: '#080808',
          secondary: '#1c1c1c',
          tertiary: '#2e2e2e',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      boxShadow: {
        // Stitch glow effects
        glow: '0 0 20px 0px rgba(51, 255, 134, 0.2)',
        'glow-sm': '0 0 10px 0px rgba(51, 255, 134, 0.15)',
        'glow-hover': '0 0 30px 0px rgba(51, 255, 134, 0.3)',
        'glow-lg': '0 0 45px 0px rgba(51, 255, 134, 0.4)',

        // Accent glow
        'accent-glow': '0 0 20px 0px rgba(225, 64, 225, 0.3)',
        'accent-glow-hover': '0 0 30px 0px rgba(225, 64, 225, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px 0px rgba(51, 255, 134, 0.2)' },
          '50%': { boxShadow: '0 0 30px 0px rgba(51, 255, 134, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
