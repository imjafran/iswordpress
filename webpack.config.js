const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "build/js"),
    filename: "app.min.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm-bundler.js",
    },
  },
  plugins: [new VueLoaderPlugin()],

  mode: "production",
};
