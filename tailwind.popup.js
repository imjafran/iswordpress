module.exports = {
  content: [
    "./build/popup.html",
    "./src/js/popup.js",
    "./src/js/components/*.js",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [require('@tailwindcss/typography'),],
  important: true,
};
