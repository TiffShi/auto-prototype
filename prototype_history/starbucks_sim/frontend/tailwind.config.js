/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        starbucks: {
          green: '#00704A',
          'dark-green': '#1E3932',
          'light-green': '#D4E9E2',
          gold: '#CBA258',
          cream: '#F2F0EB',
          brown: '#4A2C2A'
        }
      },
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}