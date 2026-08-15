/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        figma: {
          green: '#0BA053',
          lightGreen: '#E6F6ED',
          border: '#E2E8F0',
          text: '#1E293B',
          textMuted: '#64748B',
          bg: '#FFFFFF',
          bgMuted: '#FAFAFA'
        }
      },
    },
  },
  plugins: [],
}
