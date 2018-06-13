const path     = require('path');
const dirTests = path.join(__dirname, 'test');

module.exports = {
    entry: 'mocha-loader!./test/index.js',
    output: {
        filename: '../dist/test.build.js',
        path: dirTests,
        publicPath: 'http://localhost:8080/test/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /(\.css|\.sass)$/,
                loader: 'null-loader',
                exclude: [
                    /build/
                ]
            },
            {
                test: /(\.jpg|\.jpeg|\.png|\.gif)$/,
                loader: 'null-loader'
            }
        ]
    }
};
