module.exports = {
  content: [
    "./build/popup.html",
    "./src/js/*.js",
    "./src/js/app.vue",
    "./src/js/components/*.js",
    "./src/js/components/*.vue",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwind-scrollbar')],
  important: true,
};
