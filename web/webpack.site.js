// @ts-check

// I really hope you've come to look at this cause you're thinking "it's a static website, why use webpack?"
// congrats - you're right in that questioning of complexity.
//
// It's worth it IMO because:
//  1. Only one build system throughout the project
//  2. I want access to the attire system inside the website
//

const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const WebpackNotifierPlugin = require("webpack-notifier")
const CopyPlugin = require("copy-webpack-plugin")

/** @type import("webpack").Configuration */
module.exports = {
    entry: "./web/site.ts",
    module: {
        rules: [
            // TS support
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            // Ensures that hashing works, but means you have to require
            // images etc for their path, and not hard-code them.
            {
                test: /\.(wav|ogg|png|svg|jpg|gif|xml|otf|fnt|mp4)$/,
                use: ["file-loader"]
            },
            {
                // https://webpack.js.org/loaders/html-loader/#export-into-html-files
                test: /\.html$/,
                use: ["file-loader?name=[name].[ext]", "extract-loader", "html-loader"]
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
        filename: "site.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        // Get notifications about failed builds as messages in the top left
        new WebpackNotifierPlugin(),

        new CopyPlugin([{ from: path.resolve(__dirname, "assets") }]),

        // This must come after HTML, generates the CSS
        new MiniCssExtractPlugin({ filename: "site.css" })
    ]
}
