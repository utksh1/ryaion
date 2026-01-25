/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sangria-red': '#A42420',
        'market-green': '#00FFC2',
        'obsidian-black': '#050505',
        'cyber-gray': '#121212',
      },
      fontFamily: {
        'bricolage': ['"Bricolage Grotesque"', 'sans-serif'],
        'plus-jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backdropBlur: {
        '24': '24px',
      },
      borderOpacity: {
        '8': '0.08',
      },
    },
  },
  plugins: [],
}
