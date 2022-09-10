module.exports = {
  content: [
    "./build/options.html",
    "./src/js/options.js",
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
};
