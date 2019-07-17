// @ts-check
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const WebpackNotifierPlugin = require("webpack-notifier")

/** @type import("webpack").Configuration */
module.exports = {
    entry: "./src/app.ts",
    // devtool: "inline-source-map",
    module: {
        rules: [
            // TS support
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            // Ensures that hashing works, but means you have to require
            // images etc for their path, and not hardcode them.
            {
                test: /\.(wav|ogg|png|svg|jpg|gif|html|xml|otf|fnt|ttf)$/,
                use: ["file-loader"]
            },
            // CSS hookup
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === "development"
                        }
                    },
                    "css-loader"
                ]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    output: {
        filename: "app.[contenthash].js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        // Get notifications about failed builds as messages in the top left
        new WebpackNotifierPlugin(),

        // This must come after HTML, generates the CSS
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].[contenthash].css",
            chunkFilename: "[id].css"
        })
    ]
}
