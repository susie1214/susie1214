/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        poly: {
          blue: '#0A66D2',
          'blue-light': '#E8F3FF',
          'blue-dark': '#004AAD',
        }
      }
    },
  },
  plugins: [],
}
