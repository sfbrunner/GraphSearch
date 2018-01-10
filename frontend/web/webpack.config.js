var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

const WatchTimePlugin = require('webpack-watch-time-plugin');

module.exports = {
  context: path.join(__dirname, "static/scripts"),
  devtool: debug ? "inline-sourcemap" : false,
  entry: "./jsx/routehandler.js",
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader?cacheDirectory=true',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        }
      }
    ]
  },
  output: {
    path: __dirname + "/static/scripts/js",
    filename: "routehandler.js"
  },
  plugins: debug ? [] : [
    WatchTimePlugin,
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};