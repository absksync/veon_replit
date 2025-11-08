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
          orange: '#FFB000',
          dark: '#0A0A0A',
        },
      },
      boxShadow: {
        glow: '0 0 25px rgba(255, 176, 0, 0.7)',
      },
    },
  },
  plugins: [],
}
