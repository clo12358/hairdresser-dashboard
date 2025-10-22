/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        salon: {
          primary: "#8A7563",   // taupe
          secondary: "#AD947F", // warm beige
          accent: "#D2BFAF",    // light sand
          neutral: "#3B2F2F",   // text dark
          "base-100": "#F9F4ED",// off white bg
          info: "#64B5F6",
          success: "#4CAF50",
          warning: "#F1DCC3",   // soft cream
          error: "#FF8A80",
        },
      },
    ],
  },
};
