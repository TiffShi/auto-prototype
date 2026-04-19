/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-black': '#121212',
        'spotify-dark': '#181818',
        'spotify-darker': '#282828',
        'spotify-light': '#B3B3B3',
        'spotify-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Circular', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}