const merge = require("webpack-merge")
const webpack = require("webpack")
const path = require("path")

const AppCachePlugin = require("appcache-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const common = require("./webpack.common.js")

module.exports = merge(common, {
    output: {
        filename: "app.[contenthash].js",
        path: path.resolve(__dirname, "dist", "demo")
    },
    mode: "production",
    plugins: [
        // Creates the HTML files
        new HtmlWebpackPlugin({
            title: "Flappy Royale",
            meta: { viewport: "width=160, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" },
            production: true,
            template: "src/index.template"
        }),

        // It seems odd we're stringifying instead of just inlining `true`, but this is actually necessary!
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
            DEMO: JSON.stringify(true)
        }),
        new CleanWebpackPlugin(),
        new AppCachePlugin({
            network: ["*"],
            settings: ["prefer-online"],
            output: "manifest.appcache"
        })
    ]
})
