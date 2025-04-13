/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d87ff', // Primary color
        white: '#ffffff',  // Background color
        gray: {
          light: '#f7f7f7',  // Light gray for modal background
          DEFAULT: '#e5e5e5', // Default gray for outlines or borders
        },
        text: {
          light: "#717171", // Things less important/ secondary
          DEFAULT: "#222222", // Mostly all text, titles, headings, etc
        }
      },
    },
  },
  plugins: [],
}
