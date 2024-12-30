/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb',  // blue-600
        },
        error: '#ef4444',
        success: '#22c55e',
      }
    },
  },
  plugins: [],
}