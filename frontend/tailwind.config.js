/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      boxShadow: {
        'inset': '0px -20px 50px rgb(0, 0, 0, 0.5) inset',
      },
    },
  },
  plugins: [],
}
