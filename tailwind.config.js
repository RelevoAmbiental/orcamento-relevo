/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'relevo-green': '#2E7D32',
        'relevo-green-light': '#4CAF50',
        'relevo-blue': '#0097A7',
        'relevo-orange': '#FF6B35',
        'relevo-text': '#333333',
        'relevo-background': '#FFFFFF',
        'relevo-border': '#DDDDDD',
        'relevo-light-gray': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Montserrat', 'Roboto', 'Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
