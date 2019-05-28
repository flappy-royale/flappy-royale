const merge = require('webpack-merge');
const webpack = require('webpack')

const HtmlWebpackPlugin = require("html-webpack-plugin")

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "development",
  plugins: [
    // Creates the HTML files
    new HtmlWebpackPlugin({
      title: "Flappy Royale",
      meta: { viewport: "width=device-width, initial-scale=1, shrink-to-fit=no" },
      production: false,
      template: "src/index.template"
    }),

    // It seems odd we're stringifying instead of just inlining `false`, but this is actually necessary!
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
    })
  ]
})