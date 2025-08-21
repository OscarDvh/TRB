/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,astro,jsx,tsx}", // ajusta según tu estructura
  ],
  theme: {
    extend: {
      colors: {
        customRed: "#EE1C02",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#EE1C02",
          "secondary": "#1B2A41",
          "accent": "#F59E0B",
          "neutral": "#2A2E37",
          "base-100": "#FFFFFF",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
};
