const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = env => {
    const removeEmpty = array => array.filter(p => !!p);

    const NODE_ENV = 'production' ;

    return {
        mode: 'production',
        entry: {
            app: path.join(__dirname, '../client/js/entry.tsx'),
            vendor: ['react', 'react-dom', 'mobx', 'mobx-react', 'tslib'],
        },

        resolve: {
            //modules: ['node_modules'],
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },

        output: {
            filename: '[name].js',
            path: path.join(__dirname, '../client/js')
        },

        module: {
            rules: [
                { test: /\.tsx?$/, loader: "ts-loader",  exclude: /node_modules/ },
                {test: /\.css$/, use: [ 'style-loader', 'css-loader']},
                {test: /\.scss$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ]}
            ]
        },

        plugins: removeEmpty([
            new UglifyJSPlugin({}),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
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
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ]),
    };
};