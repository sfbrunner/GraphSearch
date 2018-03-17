const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './static/scripts/jsx/routehandler.js'
    },
    plugins: [
        new CleanWebpackPlugin(['./static/scripts/js']),
        new HtmlWebpackPlugin({
            title: 'Production'
        })
    ],
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
    }
};