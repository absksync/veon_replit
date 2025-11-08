/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veon: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 1, filter: 'blur(4px)' },
          '50%': { opacity: 0.8, filter: 'blur(8px)' },
        }
      }
    },
  },
  plugins: [],
}
