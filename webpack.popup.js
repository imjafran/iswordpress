const path = require("path"); 

module.exports = {
  entry: "./src/js/popup.js",
  output: {
    path: path.resolve(__dirname, "build/js"),
    filename: "popup.min.js",
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