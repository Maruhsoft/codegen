/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1b1e',
          surface: '#25262b',
          border: '#2c2e33',
          text: '#c1c2c5',
          primary: '#228be6',
          secondary: '#868e96',
          accent: '#4dabf7',
        },
      },
    },
  },
  plugins: [],
};