module.exports = {
  content: [
    "./index.html",
    "./src/*.js",
    "./src/*.vue",
    "./src/**/*.vue",
    "./src/**/*.js",
  ],
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [
    require('autoprefixer'),
    require('tailwind-scrollbar')
  ],
  important: true,
};
