const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'sass-loader' },
                ],
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 50000,
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.scss', '.js', '.json', '.png', '.gif', '.jpg', '.svg', '.tsx', '.ts'],
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '',
        filename: 'component.js',
        libraryTarget: 'umd',
    },
    performance: {
        hints: false
    },
};
