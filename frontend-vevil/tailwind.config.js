/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false, // Esta línea es la clave para evitar conflictos con PrimeVue
  },
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}