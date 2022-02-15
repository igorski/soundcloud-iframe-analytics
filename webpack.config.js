const path    = require( "path" );
const webpack = require( "webpack" );

const dirNode = "node_modules";
const dirApp  = path.join( __dirname, "src" );

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        sia: "./index"
    },
    resolve: {
        modules: [
            dirNode,
            dirApp
        ]
    },
    module: {
        rules: [
            // BABEL
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules)/,
                options: {
                    compact: true
                }
            }
        ]
    }
};
