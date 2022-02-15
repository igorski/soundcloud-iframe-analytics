const path               = require( "path" );
const merge              = require( "webpack-merge" );
const CleanWebpackPlugin = require( "clean-webpack-plugin" );
const webpackConfig      = require( "./webpack.config" );

const OUTPUT_FOLDER = "dist";

module.exports = merge( webpackConfig, {

    devtool: "source-map",

    output: {
        path     : path.join( __dirname, OUTPUT_FOLDER ),
        filename : "[name].min.js"
    },

    plugins: [
        new CleanWebpackPlugin([ OUTPUT_FOLDER ])
    ]

});
