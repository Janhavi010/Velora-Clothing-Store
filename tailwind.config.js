/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDF1F5",
        ink: "#241F1A",
        rose: "#C48A93",
        plum: "#4A2E3A",
        gold: "#A9793F",
        sand: "#EDE3D8",
        muted: "#8A7B68",
        berry: "#7A3B4E",
      },
    },
  },
  plugins: [],
};