const path = require("path"); 

module.exports = {
  entry: "./src/js/options.js",
  output: {
    path: path.resolve(__dirname, "build/js"),
    filename: "options.min.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  mode: "production",
};