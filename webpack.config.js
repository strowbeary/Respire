const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
    devServer: {
        host: '0.0.0.0'
    },
    entry: {
        bundle: "./src/index.js",
        SoundKitDebugger: "./src/lib/SoundKit/Debugger.js"
    },
    resolve: {
        extensions: ['.mjs', '.js', '.svelte'],
        alias: {
            components: path.resolve(__dirname, 'src/components/'),
            assets: path.resolve(__dirname, 'src/assets/'),
            utils: path.resolve(__dirname, 'src/utils/'),
            lib: path.resolve(__dirname, 'src/lib/')
        }
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        chunkFilename: '[name].[contenthash].js'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `modules/${packageName.replace('@', '-')}.npm`;
                    },
                },
            },
        },
    },
    module: {
        rules: [
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        },
        {
            test: /\.svelte$/,
            exclude: /node_modules/,
            use: 'svelte-loader'
        },
        {
            test: /\.js?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    babelrc: false,
                    plugins: [
                    "transform-dynamic-import",
                    "@babel/plugin-syntax-dynamic-import",
                    "@babel/plugin-proposal-object-rest-spread",
                    ["@babel/transform-runtime", {
                        "regenerator": true
                    }]
                    ],
                    presets: [
                    ['@babel/env', {
                        targets: {
                            browsers: ['last 2 versions']
                        }
                    }]
                    ]
                },
            },
        },
        {
            test: /\.(png|svg|jpg|gif|wav)$/,
            use: [
            {
                loader: 'file-loader?name=[name].[sha512:hash:base64:7].[ext]',
                options: {
                    outputPath: 'assets',
                    name: '[name].[hash].[ext]',
                },
            },
            ]
        },
        {
            test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
                {
                    loader: 'file-loader?name=[name].[sha512:hash:base64:7].[ext]',
                    options: {
                        outputPath: 'assets',
                        name: '[name].[hash].[ext]',
                    },
                },
            ]
        }
        ]
    },
    mode,
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            hash: true,
            filename: './index.html' //relative to root of the application
        }),
        new WorkboxPlugin.GenerateSW({
            include: [/\.(?:png|jpg|jpeg|svg|wav|js|html)$/],
            importsDirectory: "assets",
                // Define runtime caching rules.
            runtimeCaching: [{
                urlPattern: /\.(?:png|jpg|jpeg|svg|wav|js|html)$/,

                // Apply a cache-first strategy.
                handler: 'StaleWhileRevalidate',

                options: {
                    // Use a custom cache name.
                    cacheName: 'assets'
                },
            }],
        })
    ],
    devtool: prod ? false : 'source-map'
};
