const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
                test: /\.js$/,
                options: {
                    presets: ["@babel/react"],
                    plugins: [
                        ['import', {libraryName: "antd", style: true}]
                    ]
                },
            },
            {
                test: /\.(gif|svg|jpg|png)$/,
                loader: "file-loader",
            },
            {
                test: /\.less$/,
                loaders: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "less-loader",

                        options: {
                            modifyVars: {"@primary-color": "#d8df19"},
                            javascriptEnabled: true
                        }
                    },
                ],
                include: path.resolve(__dirname, "../")
            }
        ]
    }
};