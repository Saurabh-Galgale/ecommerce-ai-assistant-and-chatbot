/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector", // <--- Change "class" to "selector"
  theme: {
    extend: {},
  },
  plugins: [],
};
