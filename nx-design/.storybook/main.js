
module.exports = {
      entry: "./index.js",
      mode: "development",
      output: {
        filename: "./main.js"
      },

  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links', '@storybook/addon-docs/react/preset', "@storybook/preset-ant-design"]
},
 {
    rules: [
        {
            test: /\.m?js[x]$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: "babel-loader"
            }
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: ["file-loader"]
        }
    ]
};