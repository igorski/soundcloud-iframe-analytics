const path              = require( "path" );
const webpack           = require( "webpack" );
const merge             = require( "webpack-merge" );
const HtmlWebpackPlugin = require( "html-webpack-plugin" );
const webpackConfig     = require( "./webpack.config" );

const DEMO_FOLDER = path.join( __dirname, "demo" );

module.exports = merge( webpackConfig, {

    entry: {
        sia: `${DEMO_FOLDER}/index.js`
    },

    devtool: "eval",

    output: {
        pathinfo  : true,
        publicPath: "/",
        filename  : "[name].js"
    },

    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: true
        }),

        new HtmlWebpackPlugin({
            template : `${DEMO_FOLDER}/index.ejs`,
            title    : "dev"
        })
    ],
});
