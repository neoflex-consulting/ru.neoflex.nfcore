
module.exports = {
      entry: "./index.js",
      mode: "development",
      output: {
        filename: "./main.js"
      },

  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links', '@storybook/addon-docs/preset', "@storybook/preset-ant-design"]
},
 {
    rules: [
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            ],
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: ["file-loader"]
        }
    ]
};