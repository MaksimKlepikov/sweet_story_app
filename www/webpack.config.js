const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'js', 'index.js'),
    // entry: './js/indexBrowser.js)',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: "/assets/",
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    watch: true,
    devServer: {
        // contentBase: 'build/',
    }
};