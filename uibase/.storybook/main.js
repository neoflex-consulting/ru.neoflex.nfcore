const path = require("path");

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/preset-typescript',
    '@storybook/addon-actions',
    '@storybook/addon-actions/register',
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        loaders: [
          "style-loader",
          "css-loader",
          {
            loader: "less-loader",
            options: { javascriptEnabled : true }
          }
        ],
        include: path.resolve(__dirname, "../")
      }
    ]
  }

};


