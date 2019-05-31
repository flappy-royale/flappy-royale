const merge = require("webpack-merge")
const webpack = require("webpack")

const AppCachePlugin = require("appcache-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const common = require("./webpack.common.js")

module.exports = merge(common, {
    mode: "production",
    plugins: [
        // Creates the HTML files
        new HtmlWebpackPlugin({
            title: "Flappy Royale",
            meta: { viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
            production: true,
            template: "src/index.template"
        }),

        // It seems odd we're stringifying instead of just inlining `true`, but this is actually necessary!
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new CleanWebpackPlugin(),
        new AppCachePlugin({
            network: ["*"],
            settings: ["prefer-online"],
            output: "manifest.appcache"
        })
    ]
})
