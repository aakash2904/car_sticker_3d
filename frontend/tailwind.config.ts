/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#253047',
          850: '#172033',
          950: '#0a1628',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
