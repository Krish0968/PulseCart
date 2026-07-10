/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f3ff',
          100: '#e1e7fe',
          200: '#c8d3fd',
          300: '#a3b5fc',
          400: '#798dfa',
          500: '#4f5ef7',
          600: '#383ef1',
          700: '#2b2ce0',
          800: '#2424b9',
          900: '#222394',
          950: '#151457',
        },
      },
    },
  },
  plugins: [],
}
