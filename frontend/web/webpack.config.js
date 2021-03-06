var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');
const PrintTimeWebpackPlugin = require('print-time-webpack');

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
      }, {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader?limit=100000' }
    ]
  },
  output: {
    path: __dirname + "/static/scripts/js", 
    filename: "routehandler.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new PrintTimeWebpackPlugin(),
  ],
};
