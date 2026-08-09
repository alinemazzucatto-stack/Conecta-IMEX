/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#0891b2',
        accent: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
