const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
    devServer: {
        host: '0.0.0.0'
    },
    entry: {
        bundle: "./src/index.js"
    },
    resolve: {
        extensions: ['.mjs', '.js', '.svelte'],
        alias: {
            components: path.resolve(__dirname, 'src/components/'),
            assets: path.resolve(__dirname, 'src/assets/'),
            lib: path.resolve(__dirname, 'src/lib/')
        }
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        chunkFilename: '[name].[id].js'
    },
    module: {
        rules: [
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
                    'file-loader'
                ]
            }
        ]
    },
    mode,
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    devtool: prod ? false : 'source-map'
};
