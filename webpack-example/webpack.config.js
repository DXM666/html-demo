const path = require("path");
const ChunkRelationPlugin = require("./plugins/ChunkRelationPlugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { DependencyExtractionPlugin } = require("webpack-dependency-suite");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env"]],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ChunkRelationPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
    }),
    new DependencyExtractionPlugin()
  ],
};
