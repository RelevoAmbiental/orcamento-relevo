/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'relevo': {
          green: {
            50: '#f0f9f0',
            100: '#dcf2dc',
            200: '#bce5bc',
            300: '#8bd18b',
            400: '#56b856',
            500: '#3a9e3a', // Cor principal
            600: '#2d7f2d',
            700: '#256425',
            800: '#215021',
            900: '#1c421c',
          },
          blue: {
            50: '#f0f7ff',
            100: '#e0effe',
            200: '#bae0fd',
            300: '#7cc8fc',
            400: '#36acf8',
            500: '#0c8ce8', // Cor secundária
            600: '#006fc6',
            700: '#0059a1',
            800: '#044b85',
            900: '#0a3f6f',
          }
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Open Sans', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}