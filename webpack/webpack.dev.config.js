const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = env => {
    const removeEmpty = array => array.filter(p => !!p);

    const NODE_ENV = env.prod ? 'production' : 'development';

    return {
        mode: 'development',
        devtool: 'source-map',
        entry: {
            app: removeEmpty([
                'react-hot-loader/patch',
                `webpack-dev-server/client?http://localhost:3000`,
                'webpack/hot/only-dev-server',
                path.join(__dirname, '../client/js/entry.tsx')
            ]),
            vendor: ['react', 'react-dom', 'mobx', 'mobx-react', 'tslib'],
        },

        resolve: {
            //modules: ['node_modules'],
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },

        output: {
            filename: '[name].js',
            sourceMapFilename: '[name].map.js',
            path: path.join(__dirname, '../client/js'),
            publicPath: 'http://127.0.0.1:3000/'
        },

        module: {
            rules: [
                { test: /\.tsx?$/, loader: "ts-loader",  exclude: /node_modules/ },
                {test: /\.css$/, use: [ 'style-loader', 'css-loader']},
                {test: /\.scss$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ]}
            ]
        },

        plugins: removeEmpty([
            new webpack.LoaderOptionsPlugin({
                minimize: env.prod,
                debug: env.dev,
                options: {
                    context: __dirname,
                    postcss: [Autoprefixer({browsers: ['last 3 versions']})],
                },
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),

            new HtmlWebpackPlugin({
                template: path.join(__dirname, "../client/html/index.dev.html"),
                alwaysWriteToDisk: true
            }),

            new HtmlWebpackHarddiskPlugin({
                outputPath: path.join(__dirname, "../client/html"),
            }),

            new webpack.DefinePlugin({
                __DEVELOPMENT__: Boolean(NODE_ENV === "development"),
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
            }),
        ]),
    };
};