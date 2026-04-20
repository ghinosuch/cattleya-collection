/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f3d1a',
        secondary: '#c9a961',
      }
    },
  },
  plugins: [],
}
