// @ts-check
const path = require("path")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ManifestPlugin = require("webpack-manifest-plugin")

/** @type import("webpack").Configuration */
module.exports = {
    entry: "./src/app.ts",
    devtool: "inline-source-map",
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
                test: /\.(png|svg|jpg|gif)$/,
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
    mode: "development",
    plugins: [
        // @ts-ignore
        // Resets the build folder each time you run webpack
        new CleanWebpackPlugin(),
        // Creates the HTML files
        new HtmlWebpackPlugin({
            title: "Flappy Royale"
        }),
        // This must come after HTML, generates the CSS
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].[contenthash].css",
            chunkFilename: "[id].css"
        }),
        // Makes sure that we know how to get all the referenced files
        new ManifestPlugin({
            fileName: "build-manifest.json"
        })
    ]
}
